"""
File chính chạy FastAPI server.
Đặt file này trong thư mục /backend, cùng cấp với database.py, models.py, auth_utils.py, auth_deps.py, .env

Chạy server bằng lệnh:
    uvicorn main:app --reload --port 8000

Sau đó mở trình duyệt vào:
    http://localhost:8000/docs
để test API bằng giao diện Swagger.
Để test endpoint cần đăng nhập (🔒): bấm nút "Authorize" ở góc trên bên phải Swagger,
dán access_token lấy được từ /api/auth/login vào.
"""

import uuid
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import engine, Base, get_db
from models import (
    Task, TaskCreate, TaskUpdate, TaskOut,
    User, UserRegister, UserLogin, UserUpdate, UserOut, TokenOut,
)
from auth_utils import hash_password, verify_password, create_access_token
from auth_deps import get_current_user

app = FastAPI(title="Quản lý công việc & dự án CNTT API")

# Cho phép React (chạy ở port khác) gọi được API này
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # port mặc định của Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    """Tự động tạo bảng trong PostgreSQL nếu chưa có, khi server khởi động"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# ================= AUTH =================

@app.post("/api/auth/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(status_code=400, detail="Email này đã được đăng ký")

    new_user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


@app.post("/api/auth/login", response_model=TokenOut)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")

    token = create_access_token({"sub": str(user.id)})
    return TokenOut(access_token=token)


# ================= USERS (🔒 cần đăng nhập) =================

@app.get("/api/users/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.put("/api/users/me", response_model=UserOut)
async def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    await db.commit()
    await db.refresh(current_user)
    return current_user


# ================= TASKS =================

@app.post("/api/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
async def create_task(task: TaskCreate, db: AsyncSession = Depends(get_db)):
    new_task = Task(**task.model_dump())
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return new_task


@app.get("/api/tasks", response_model=list[TaskOut])
async def get_tasks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).order_by(Task.created_at.desc()))
    return result.scalars().all()


@app.get("/api/tasks/{task_id}", response_model=TaskOut)
async def get_task(task_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    task = await db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy task")
    return task


@app.put("/api/tasks/{task_id}", response_model=TaskOut)
async def update_task(task_id: uuid.UUID, task: TaskUpdate, db: AsyncSession = Depends(get_db)):
    existing = await db.get(Task, task_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy task")

    update_data = task.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(existing, field, value)

    await db.commit()
    await db.refresh(existing)
    return existing


@app.delete("/api/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    existing = await db.get(Task, task_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy task")

    await db.delete(existing)
    await db.commit()
    return None


@app.get("/")
async def root():
    return {"message": "API đang chạy. Vào /docs để xem tài liệu API."}