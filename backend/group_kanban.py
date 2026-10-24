"""Kanban nhóm: phân Task dự án cho nhóm và quản lý Subtask."""
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import ForeignKey, String, Text, DateTime, UniqueConstraint, select, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession
from database import Base, get_db
from models import User, Task, ProjectMember, ALLOWED_STATUS, ALLOWED_PRIORITY
from project_groups import ProjectGroup, GroupMember, get_group, require_member, require_owner
from auth_deps import get_current_user

router = APIRouter(prefix='/api/projects/{project_id}/groups/{group_id}/kanban', tags=['Group Kanban'])

class GroupTask(Base):
    __tablename__ = 'group_tasks'
    __table_args__ = (UniqueConstraint('task_id', name='uq_group_task_task'),)
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('project_groups.id', ondelete='CASCADE'), nullable=False, index=True)
    task_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False)

class Subtask(Base):
    __tablename__ = 'group_subtasks'
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('project_groups.id', ondelete='CASCADE'), nullable=False, index=True)
    task_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default='todo')
    priority: Mapped[str] = mapped_column(String(50), nullable=False, default='medium')
    assignee_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class TaskAssign(BaseModel):
    task_id: uuid.UUID

class SubtaskCreate(BaseModel):
    task_id: uuid.UUID
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    priority: str = 'medium'
    assignee_id: Optional[uuid.UUID] = None

class SubtaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee_id: Optional[uuid.UUID] = None

async def context(db, project_id, group_id, user_id):
    member = await require_member(db, project_id, user_id)
    group = await get_group(db, project_id, group_id)
    is_owner = member.role == 'owner'
    is_leader = group.leader_id == user_id
    in_group = (await db.execute(select(GroupMember.id).where(GroupMember.group_id == group_id, GroupMember.user_id == user_id))).scalar_one_or_none() is not None
    if not (is_owner or in_group):
        raise HTTPException(403, 'Bạn không thuộc nhóm này')
    return is_owner, is_leader

def manager(owner, leader):
    if not (owner or leader):
        raise HTTPException(403, 'Chỉ Owner hoặc Leader được quản lý Subtask')

async def validate_assignee(db, group_id, user_id):
    if user_id is not None:
        exists = (await db.execute(select(GroupMember.id).where(GroupMember.group_id == group_id, GroupMember.user_id == user_id))).scalar_one_or_none()
        if not exists:
            raise HTTPException(422, 'Người được giao phải là thành viên nhóm')

async def assigned_task(db, project_id, group_id, task_id):
    task = await db.get(Task, task_id)
    if not task or task.project_id != project_id:
        raise HTTPException(404, 'Không tìm thấy Task dự án')
    entry = (await db.execute(select(GroupTask).where(GroupTask.group_id == group_id, GroupTask.task_id == task_id))).scalar_one_or_none()
    if not entry:
        raise HTTPException(422, 'Task chưa được giao cho nhóm này')
    return task

async def serialize_subtask(db, s):
    user = await db.get(User, s.assignee_id) if s.assignee_id else None
    return dict(id=str(s.id), group_id=str(s.group_id), task_id=str(s.task_id), title=s.title,
                description=s.description, status=s.status, priority=s.priority,
                assignee_id=str(s.assignee_id) if s.assignee_id else None,
                assignee_name=user.name if user else None,
                created_at=s.created_at.isoformat() if s.created_at else None)

@router.get('')
async def board(project_id: uuid.UUID, group_id: uuid.UUID, current_user: User=Depends(get_current_user), db: AsyncSession=Depends(get_db)):
    await context(db, project_id, group_id, current_user.id)
    links = (await db.execute(select(GroupTask).where(GroupTask.group_id == group_id))).scalars().all()
    tasks = []
    for link in links:
        t = await db.get(Task, link.task_id)
        if t:
            tasks.append(dict(id=str(t.id), title=t.title, status=t.status, priority=t.priority, description=t.description))
    subtasks = (await db.execute(select(Subtask).where(Subtask.group_id == group_id).order_by(Subtask.created_at))).scalars().all()
    return {'tasks': tasks, 'subtasks': [await serialize_subtask(db,s) for s in subtasks]}

@router.post('/tasks', status_code=201)
async def assign_task(project_id: uuid.UUID, group_id: uuid.UUID, payload: TaskAssign, current_user: User=Depends(get_current_user), db: AsyncSession=Depends(get_db)):
    await require_owner(db, project_id, current_user.id)
    await get_group(db, project_id, group_id)
    task = await db.get(Task, payload.task_id)
    if not task or task.project_id != project_id: raise HTTPException(404, 'Task không thuộc dự án')
    existing = (await db.execute(select(GroupTask).where(GroupTask.task_id == task.id))).scalar_one_or_none()
    if existing: raise HTTPException(409, 'Task đã được giao cho một nhóm')
    db.add(GroupTask(group_id=group_id, task_id=task.id))
    await db.commit()
    return {'ok': True}

@router.delete('/tasks/{task_id}', status_code=204)
async def unassign_task(project_id: uuid.UUID, group_id: uuid.UUID, task_id: uuid.UUID, current_user: User=Depends(get_current_user), db: AsyncSession=Depends(get_db)):
    await require_owner(db, project_id, current_user.id)
    await assigned_task(db, project_id, group_id, task_id)
    has_subtasks = (await db.execute(select(Subtask.id).where(Subtask.group_id == group_id, Subtask.task_id == task_id).limit(1))).first()
    if has_subtasks: raise HTTPException(409, 'Hãy xóa Subtask trước khi gỡ Task khỏi nhóm')
    link = (await db.execute(select(GroupTask).where(GroupTask.group_id == group_id, GroupTask.task_id == task_id))).scalar_one()
    await db.delete(link)
    await db.commit()

@router.post('/subtasks', status_code=201)
async def create_subtask(project_id: uuid.UUID, group_id: uuid.UUID, payload: SubtaskCreate, current_user: User=Depends(get_current_user), db: AsyncSession=Depends(get_db)):
    owner, leader = await context(db, project_id, group_id, current_user.id)
    manager(owner, leader)
    await assigned_task(db, project_id, group_id, payload.task_id)
    await validate_assignee(db, group_id, payload.assignee_id)
    if payload.priority not in ALLOWED_PRIORITY: raise HTTPException(422, 'Độ ưu tiên không hợp lệ')
    title = payload.title.strip()
    if not title: raise HTTPException(422, 'Tên Subtask không được trống')
    s = Subtask(group_id=group_id, task_id=payload.task_id, title=title, description=payload.description, priority=payload.priority, assignee_id=payload.assignee_id)
    db.add(s)
    await db.commit()
    await db.refresh(s)
    return await serialize_subtask(db,s)

@router.patch('/subtasks/{subtask_id}')
async def update_subtask(project_id: uuid.UUID, group_id: uuid.UUID, subtask_id: uuid.UUID, payload: SubtaskUpdate, current_user: User=Depends(get_current_user), db: AsyncSession=Depends(get_db)):
    owner, leader = await context(db, project_id, group_id, current_user.id)
    s = await db.get(Subtask, subtask_id)
    if not s or s.group_id != group_id: raise HTTPException(404, 'Không tìm thấy Subtask')
    data = payload.model_dump(exclude_unset=True)
    if not (owner or leader):
        if s.assignee_id != current_user.id or set(data) - {'status'}:
            raise HTTPException(403, 'Member chỉ được đổi trạng thái Subtask được giao')
    if 'status' in data and data['status'] not in ALLOWED_STATUS: raise HTTPException(422, 'Trạng thái không hợp lệ')
    if 'priority' in data and data['priority'] not in ALLOWED_PRIORITY: raise HTTPException(422, 'Độ ưu tiên không hợp lệ')
    if 'assignee_id' in data: await validate_assignee(db, group_id, data['assignee_id'])
    if 'title' in data:
        data['title'] = (data['title'] or '').strip()
        if not data['title']: raise HTTPException(422, 'Tên Subtask không được trống')
    for k,v in data.items(): setattr(s,k,v)
    await db.commit()
    await db.refresh(s)
    return await serialize_subtask(db,s)

@router.delete('/subtasks/{subtask_id}', status_code=204)
async def delete_subtask(project_id: uuid.UUID, group_id: uuid.UUID, subtask_id: uuid.UUID, current_user: User=Depends(get_current_user), db: AsyncSession=Depends(get_db)):
    owner, leader = await context(db, project_id, group_id, current_user.id)
    manager(owner, leader)
    s = await db.get(Subtask, subtask_id)
    if not s or s.group_id != group_id: raise HTTPException(404, 'Không tìm thấy Subtask')
    await db.delete(s)
    await db.commit()
