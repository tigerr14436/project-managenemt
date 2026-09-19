from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


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