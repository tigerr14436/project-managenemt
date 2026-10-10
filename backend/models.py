"""
File định nghĩa bảng (model) cho PostgreSQL bằng SQLAlchemy.
Đặt file này trong thư mục /backend.
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from pydantic import BaseModel, Field, EmailStr

from database import Base


# ========== BẢNG TRONG DATABASE (SQLAlchemy ORM) ==========

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    join_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ProjectMember(Base):
    """Bảng trung gian: ai thuộc dự án nào, vai trò gì (owner/member)"""
    __tablename__ = "project_members"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(50), default="member")  # owner | member


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="todo")  # todo|in_progress|review|done
    priority: Mapped[str] = mapped_column(String(50), default="medium")
    deadline: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    assignee: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ========== SCHEMA CHO AUTH / USERS (Pydantic) ==========

class UserRegister(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)


class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ========== SCHEMA CHO PROJECTS (Pydantic) ==========

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1)


class ProjectJoinIn(BaseModel):
    join_code: str = Field(..., min_length=1)


class TaskSummary(BaseModel):
    completed: int
    total: int


class ProjectOut(BaseModel):
    id: uuid.UUID
    name: str
    join_code: str
    status: str
    role: str
    member_count: int
    tasks: TaskSummary


# ========== SCHEMA CHO TASKS (Pydantic) ==========

ALLOWED_STATUS = {"todo", "in_progress", "review", "done"}
ALLOWED_PRIORITY = {"low", "medium", "high"}


class TaskBase(BaseModel):
    project_id: uuid.UUID
    title: str = Field(..., min_length=1, description="Tên công việc")
    description: Optional[str] = Field(None, description="Mô tả chi tiết")
    status: str = Field(default="todo")
    priority: str = Field(default="medium")
    deadline: Optional[datetime] = Field(None)
    assignee: Optional[str] = Field(None)


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    deadline: Optional[datetime] = None
    assignee: Optional[str] = None


class TaskOut(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    title: str
    description: Optional[str]
    status: str
    priority: str
    deadline: Optional[datetime]
    assignee: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True