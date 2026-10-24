"""DevTask: API nhóm dự án. Import và include_router trong main.py."""
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import ForeignKey, String, DateTime, UniqueConstraint, select, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession
from database import Base, get_db
from models import User, Project, ProjectMember
from auth_deps import get_current_user

router = APIRouter(prefix='/api/projects/{project_id}/groups', tags=['Project groups'])

class ProjectGroup(Base):
    __tablename__ = 'project_groups'
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    leader_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class GroupMember(Base):
    __tablename__ = 'group_members'
    __table_args__ = (UniqueConstraint('group_id', 'user_id', name='uq_group_member'),)
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('project_groups.id', ondelete='CASCADE'), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

class GroupCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)

class GroupLeaderUpdate(BaseModel):
    user_id: Optional[uuid.UUID] = None

class GroupMemberAdd(BaseModel):
    user_id: uuid.UUID

async def membership(db, project_id, user_id):
    return (await db.execute(select(ProjectMember).where(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id))).scalar_one_or_none()

async def require_member(db, project_id, user_id):
    member = await membership(db, project_id, user_id)
    if not member: raise HTTPException(403, 'Bạn không thuộc dự án')
    return member

async def require_owner(db, project_id, user_id):
    member = await require_member(db, project_id, user_id)
    if member.role != 'owner': raise HTTPException(403, 'Chỉ chủ dự án được thực hiện')

async def get_group(db, project_id, group_id):
    group = await db.get(ProjectGroup, group_id)
    if not group or group.project_id != project_id: raise HTTPException(404, 'Không tìm thấy nhóm')
    return group

async def require_group_manager(db, project_id, group, user_id):
    member = await require_member(db, project_id, user_id)
    if member.role != 'owner' and group.leader_id != user_id:
        raise HTTPException(403, 'Chỉ chủ dự án hoặc trưởng nhóm được quản lý thành viên')

async def serialize_group(db, group):
    leader = await db.get(User, group.leader_id) if group.leader_id else None
    rows = (await db.execute(select(User).join(GroupMember, GroupMember.user_id == User.id).where(GroupMember.group_id == group.id).order_by(User.name))).scalars().all()
    return {'id': str(group.id), 'project_id': str(group.project_id), 'name': group.name,
            'leader_id': str(group.leader_id) if group.leader_id else None,
            'leader': leader.name if leader else None,
            'leaderEmail': leader.email if leader else None,
            'members': [{'id': str(u.id), 'name': u.name, 'email': u.email, 'status': 'accepted', 'role': 'leader' if u.id == group.leader_id else 'member'} for u in rows]}

@router.get('')
async def list_groups(project_id: uuid.UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await require_member(db, project_id, current_user.id)
    groups = (await db.execute(select(ProjectGroup).where(ProjectGroup.project_id == project_id).order_by(ProjectGroup.created_at))).scalars().all()
    return [await serialize_group(db, g) for g in groups]

@router.post('', status_code=status.HTTP_201_CREATED)
async def create_group(project_id: uuid.UUID, payload: GroupCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await require_owner(db, project_id, current_user.id)
    group = ProjectGroup(project_id=project_id, name=payload.name.strip())
    if not group.name: raise HTTPException(422, 'Tên nhóm không được trống')
    db.add(group)
    await db.commit()
    await db.refresh(group)
    return await serialize_group(db, group)

@router.put('/{group_id}/leader')
async def set_leader(project_id: uuid.UUID, group_id: uuid.UUID, payload: GroupLeaderUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await require_owner(db, project_id, current_user.id)
    group = await get_group(db, project_id, group_id)
    if payload.user_id:
        await require_member(db, project_id, payload.user_id)
        existing = (await db.execute(select(GroupMember).where(GroupMember.group_id == group_id, GroupMember.user_id == payload.user_id))).scalar_one_or_none()
        if not existing: db.add(GroupMember(group_id=group_id, user_id=payload.user_id))
    group.leader_id = payload.user_id
    await db.commit()
    return await serialize_group(db, group)

@router.post('/{group_id}/members', status_code=status.HTTP_201_CREATED)
async def add_member(project_id: uuid.UUID, group_id: uuid.UUID, payload: GroupMemberAdd, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    group = await get_group(db, project_id, group_id)
    await require_group_manager(db, project_id, group, current_user.id)
    await require_member(db, project_id, payload.user_id)
    existing = (await db.execute(select(GroupMember).where(GroupMember.group_id == group_id, GroupMember.user_id == payload.user_id))).scalar_one_or_none()
    if existing: raise HTTPException(409, 'Thành viên đã thuộc nhóm')
    db.add(GroupMember(group_id=group_id, user_id=payload.user_id))
    await db.commit()
    return await serialize_group(db, group)

@router.delete('/{group_id}/members/{user_id}', status_code=204)
async def remove_member(project_id: uuid.UUID, group_id: uuid.UUID, user_id: uuid.UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    group = await get_group(db, project_id, group_id)
    await require_group_manager(db, project_id, group, current_user.id)
    if group.leader_id == user_id: raise HTTPException(409, 'Hãy thay đổi trưởng nhóm trước khi gỡ người này')
    entry = (await db.execute(select(GroupMember).where(GroupMember.group_id == group_id, GroupMember.user_id == user_id))).scalar_one_or_none()
    if not entry: raise HTTPException(404, 'Thành viên không thuộc nhóm')
    await db.delete(entry)
    await db.commit()

@router.delete('/{group_id}', status_code=204)
async def delete_group(project_id: uuid.UUID, group_id: uuid.UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await require_owner(db, project_id, current_user.id)
    group = await get_group(db, project_id, group_id)
    for entry in (await db.execute(select(GroupMember).where(GroupMember.group_id == group_id))).scalars().all():
        await db.delete(entry)
    await db.delete(group)
    await db.commit()
