"""
File chính chạy FastAPI server.
Đặt file này trong thư mục /backend.

Chạy server bằng lệnh:
    uvicorn main:app --reload --port 8000

QUAN TRỌNG: Bảng tasks và projects đã đổi cấu trúc (thêm cột mới, thêm bảng mới).
SQLAlchemy create_all() CHỈ tạo bảng chưa tồn tại, KHÔNG tự sửa bảng cũ đã có.
Vì vậy cần XÓA các bảng cũ (tasks, users nếu cần làm lại từ đầu) trong pgAdmin
trước khi chạy lại, để hệ thống tạo lại đúng cấu trúc mới. Xem hướng dẫn đi kèm.
"""

import uuid
import random
import string
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database import engine, Base, get_db
from models import (
    Task, TaskCreate, TaskUpdate, TaskOut, ALLOWED_STATUS, ALLOWED_PRIORITY,
    User, UserRegister, UserLogin, UserUpdate, UserOut, TokenOut,
    Project, ProjectMember, ProjectCreate, ProjectJoinIn, ProjectOut, TaskSummary,
)
from auth_utils import hash_password, verify_password, create_access_token
from auth_deps import get_current_user

app = FastAPI(title="Quản lý công việc & dự án CNTT API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


def generate_join_code(name: str) -> str:
    letters = "".join(ch for ch in name.upper() if ch.isalpha())[:3] or "PRJ"
    digits = "".join(random.choices(string.digits, k=4))
    return f"{letters}-{digits}"


async def _project_task_summary(db: AsyncSession, project_id: uuid.UUID) -> TaskSummary:
    result = await db.execute(select(Task.status).where(Task.project_id == project_id))
    statuses = result.scalars().all()
    completed = sum(1 for s in statuses if s == "done")
    return TaskSummary(completed=completed, total=len(statuses))


async def _member_count(db: AsyncSession, project_id: uuid.UUID) -> int:
    result = await db.execute(
        select(func.count()).select_from(ProjectMember).where(ProjectMember.project_id == project_id)
    )
    return result.scalar_one()


async def _get_membership(db: AsyncSession, project_id: uuid.UUID, user_id: uuid.UUID) -> ProjectMember | None:
    result = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id, ProjectMember.user_id == user_id
        )
    )
    return result.scalar_one_or_none()


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


# ================= USERS (🔒) =================

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


# ================= PROJECTS (🔒 tất cả đều cần đăng nhập) =================

@app.post("/api/projects", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Sinh join_code duy nhất, thử lại nếu trùng
    while True:
        code = generate_join_code(payload.name)
        existing = await db.execute(select(Project).where(Project.join_code == code))
        if existing.scalar_one_or_none() is None:
            break

    project = Project(name=payload.name, owner_id=current_user.id, join_code=code)
    db.add(project)
    await db.flush()  # để lấy project.id trước khi commit

    member = ProjectMember(project_id=project.id, user_id=current_user.id, role="owner")
    db.add(member)
    await db.commit()
    await db.refresh(project)

    return ProjectOut(
        id=project.id, name=project.name, join_code=project.join_code,
        status=project.status, role="owner", member_count=1,
        tasks=TaskSummary(completed=0, total=0),
    )


@app.get("/api/projects", response_model=list[ProjectOut])
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Project, ProjectMember.role)
        .join(ProjectMember, ProjectMember.project_id == Project.id)
        .where(ProjectMember.user_id == current_user.id)
        .order_by(Project.created_at.desc())
    )
    rows = result.all()

    output = []
    for project, role in rows:
        output.append(ProjectOut(
            id=project.id, name=project.name, join_code=project.join_code,
            status=project.status, role=role,
            member_count=await _member_count(db, project.id),
            tasks=await _project_task_summary(db, project.id),
        ))
    return output


@app.post("/api/projects/join", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def join_project(
    payload: ProjectJoinIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    code = payload.join_code.strip().upper()
    result = await db.execute(select(Project).where(Project.join_code == code))
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=404, detail="Mã tham gia không chính xác")

    existing = await _get_membership(db, project.id, current_user.id)
    if existing is not None:
        raise HTTPException(status_code=400, detail="Bạn đã là thành viên của dự án này")

    member = ProjectMember(project_id=project.id, user_id=current_user.id, role="member")
    db.add(member)
    await db.commit()

    return ProjectOut(
        id=project.id, name=project.name, join_code=project.join_code,
        status=project.status, role="member",
        member_count=await _member_count(db, project.id),
        tasks=await _project_task_summary(db, project.id),
    )


@app.delete("/api/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_or_leave_project(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    member = await _get_membership(db, project_id, current_user.id)
    if member is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy dự án")

    if member.role == "owner":
        # Chủ dự án xóa -> xóa luôn toàn bộ task, thành viên, và chính dự án
        await db.execute(Task.__table__.delete().where(Task.project_id == project_id))
        await db.execute(ProjectMember.__table__.delete().where(ProjectMember.project_id == project_id))
        project = await db.get(Project, project_id)
        if project is not None:
            await db.delete(project)
    else:
        # Thành viên thường -> chỉ rời khỏi dự án
        await db.delete(member)

    await db.commit()
    return None


# ================= TASKS (🔒, luôn kiểm tra user có thuộc project không) =================

@app.post("/api/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if await _get_membership(db, task.project_id, current_user.id) is None:
        raise HTTPException(status_code=403, detail="Bạn không thuộc dự án này")

    if task.status not in ALLOWED_STATUS:
        raise HTTPException(status_code=422, detail=f"status phải là một trong: {', '.join(ALLOWED_STATUS)}")
    if task.priority not in ALLOWED_PRIORITY:
        raise HTTPException(status_code=422, detail=f"priority phải là một trong: {', '.join(ALLOWED_PRIORITY)}")

    new_task = Task(**task.model_dump())
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return new_task


@app.get("/api/tasks", response_model=list[TaskOut])
async def get_tasks(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if await _get_membership(db, project_id, current_user.id) is None:
        raise HTTPException(status_code=403, detail="Bạn không thuộc dự án này")

    result = await db.execute(
        select(Task).where(Task.project_id == project_id).order_by(Task.created_at.desc())
    )
    return result.scalars().all()


async def _get_task_or_403(db: AsyncSession, task_id: uuid.UUID, current_user: User) -> Task:
    task = await db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy task")
    if await _get_membership(db, task.project_id, current_user.id) is None:
        raise HTTPException(status_code=403, detail="Bạn không thuộc dự án này")
    return task


@app.get("/api/tasks/{task_id}", response_model=TaskOut)
async def get_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await _get_task_or_403(db, task_id, current_user)


@app.put("/api/tasks/{task_id}", response_model=TaskOut)
async def update_task(
    task_id: uuid.UUID,
    task: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    existing = await _get_task_or_403(db, task_id, current_user)

    update_data = task.model_dump(exclude_unset=True)
    if "status" in update_data and update_data["status"] not in ALLOWED_STATUS:
        raise HTTPException(status_code=422, detail=f"status phải là một trong: {', '.join(ALLOWED_STATUS)}")
    if "priority" in update_data and update_data["priority"] not in ALLOWED_PRIORITY:
        raise HTTPException(status_code=422, detail=f"priority phải là một trong: {', '.join(ALLOWED_PRIORITY)}")

    for field, value in update_data.items():
        setattr(existing, field, value)

    await db.commit()
    await db.refresh(existing)
    return existing


@app.delete("/api/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    existing = await _get_task_or_403(db, task_id, current_user)
    await db.delete(existing)
    await db.commit()
    return None


@app.get("/")
async def root():
    return {"message": "API đang chạy. Vào /docs để xem tài liệu API."}