from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

# ---------- TASK ----------

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, description="Tên công việc")
    description: Optional[str] = Field(None, description="Mô tả chi tiết")
    status: str = Field(default="todo", description="todo | in_progress | done")
    priority: str = Field(default="medium", description="low | medium | high")
    deadline: Optional[datetime] = Field(None, description="Hạn hoàn thành")
    assignee: Optional[str] = Field(None, description="ID hoặc tên người phụ trách")


class TaskCreate(TaskBase):
    """Dữ liệu client gửi lên khi tạo task mới"""
    pass


class TaskUpdate(BaseModel):
    """Dữ liệu client gửi lên khi cập nhật task (tất cả field đều optional)"""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    deadline: Optional[datetime] = None
    assignee: Optional[str] = None


class TaskOut(TaskBase):
    """Dữ liệu trả về cho client, có thêm id"""
    id: str = Field(..., alias="_id")

    class Config:
        populate_by_name = True


# ---------- USER  ----------

class UserRole(str, Enum):
    pm = "PM"
    developer = "Developer"
    tester = "Tester"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.developer


class UserCreate(UserBase):
    """Dữ liệu Client gửi lên khi ĐĂNG KÝ (chứa mật khẩu thô)"""
    password: str = Field(..., min_length=6, description="Mật khẩu tối thiểu 6 ký tự")


class UserLogin(BaseModel):
    """Dữ liệu Client gửi lên khi ĐĂNG NHẬP"""
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str = Field(..., alias="_id")
    email: EmailStr
    full_name: str
    role: str
    created_at: Optional[datetime] = None

    class Config:
        populate_by_name = True