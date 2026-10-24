"""Persisted focus sessions for assigned group subtasks."""
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import ForeignKey, DateTime, Integer, String, select
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession
from database import Base, get_db
from models import User
from group_kanban import Subtask, context
from auth_deps import get_current_user

router = APIRouter(prefix='/api/projects/{project_id}/groups/{group_id}/kanban/subtasks/{subtask_id}/focus', tags=['Subtask Focus'])

class FocusSession(Base):
    __tablename__ = 'subtask_focus_sessions'
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subtask_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('group_subtasks.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default='running')
    elapsed_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    resumed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

class StartFocus(BaseModel):
    reminder_minutes: int = 45

def now(): return datetime.now(timezone.utc)

def elapsed(s):
    n = s.elapsed_seconds
    if s.status == 'running' and s.resumed_at:
        n += max(0, int((now() - s.resumed_at).total_seconds()))
    return n

def dump(s):
    return {'id':str(s.id),'status':s.status,'elapsed_seconds':s.elapsed_seconds,'resumed_at':s.resumed_at.isoformat() if s.resumed_at else None,'started_at':s.started_at.isoformat(),'ended_at':s.ended_at.isoformat() if s.ended_at else None}

async def access(db, project_id, group_id, subtask_id, user_id):
    owner, leader = await context(db, project_id, group_id, user_id)
    subtask = await db.get(Subtask, subtask_id)
    if not subtask or subtask.group_id != group_id: raise HTTPException(404, 'Không tìm thấy Subtask')
    if not (owner or leader or subtask.assignee_id == user_id): raise HTTPException(403, 'Chỉ người được giao hoặc quản lý được theo dõi thời gian')
    return subtask

async def active(db, subtask_id, user_id):
    return (await db.execute(select(FocusSession).where(FocusSession.subtask_id==subtask_id,FocusSession.user_id==user_id,FocusSession.status.in_(['running','paused'])).order_by(FocusSession.started_at.desc()))).scalars().first()

@router.get('')
async def get_focus(project_id:uuid.UUID,group_id:uuid.UUID,subtask_id:uuid.UUID,current_user:User=Depends(get_current_user),db:AsyncSession=Depends(get_db)):
    await access(db,project_id,group_id,subtask_id,current_user.id)
    sessions=(await db.execute(select(FocusSession).where(FocusSession.subtask_id==subtask_id,FocusSession.user_id==current_user.id).order_by(FocusSession.started_at.desc()))).scalars().all()
    return {'active': next((dump(s) for s in sessions if s.status!='stopped'),None),'total_seconds':sum(elapsed(s) for s in sessions if s.status=='stopped'),'sessions':[dump(s) for s in sessions[:20]]}

@router.post('/start')
async def start(project_id:uuid.UUID,group_id:uuid.UUID,subtask_id:uuid.UUID,current_user:User=Depends(get_current_user),db:AsyncSession=Depends(get_db)):
    await access(db,project_id,group_id,subtask_id,current_user.id)
    if await active(db,subtask_id,current_user.id): raise HTTPException(409,'Đã có phiên đang chạy hoặc tạm dừng')
    t=now(); s=FocusSession(subtask_id=subtask_id,user_id=current_user.id,status='running',started_at=t,resumed_at=t)
    db.add(s); await db.commit(); await db.refresh(s)
    return dump(s)

@router.post('/{session_id}/{action}')
async def act(project_id:uuid.UUID,group_id:uuid.UUID,subtask_id:uuid.UUID,session_id:uuid.UUID,action:str,current_user:User=Depends(get_current_user),db:AsyncSession=Depends(get_db)):
    await access(db,project_id,group_id,subtask_id,current_user.id)
    s=await db.get(FocusSession,session_id)
    if not s or s.subtask_id!=subtask_id or s.user_id!=current_user.id: raise HTTPException(404,'Không tìm thấy phiên')
    if action=='pause' and s.status=='running':
        s.elapsed_seconds=elapsed(s);s.resumed_at=None;s.status='paused'
    elif action=='resume' and s.status=='paused':
        s.resumed_at=now();s.status='running'
    elif action=='stop' and s.status in ('paused','running'):
        s.elapsed_seconds=elapsed(s);s.resumed_at=None;s.status='stopped';s.ended_at=now()
    else: raise HTTPException(409,'Trạng thái phiên không hợp lệ')
    await db.commit();await db.refresh(s)
    return dump(s)
