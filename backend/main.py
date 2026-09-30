from fastapi import FastAPI, HTTPException, status, APIRouter, Response
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from bson.errors import InvalidId
from database import tasks_collection
from models import *
 
app = FastAPI(title="Quản lý công việc & dự án CNTT API")
 
# Cho phép React (chạy ở port khác) gọi được API này
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # port mặc định của React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
 
def task_helper(task) -> dict:
    """Chuyển _id từ ObjectId sang string để trả về JSON hợp lệ"""
    task["_id"] = str(task["_id"])
    return task
 
 
# ---------- CREATE ----------
@app.post("/api/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
async def create_task(task: TaskCreate):
    new_task = task.model_dump()
    result = await tasks_collection.insert_one(new_task)
    created = await tasks_collection.find_one({"_id": result.inserted_id})
    return task_helper(created)
 
 
# ---------- READ (danh sách) ----------
@app.get("/api/tasks", response_model=list[TaskOut])
async def get_tasks():
    tasks = await tasks_collection.find().to_list(1000)
    return [task_helper(t) for t in tasks]
 
 
# ---------- READ (1 task theo id) ----------
@app.get("/api/tasks/{task_id}", response_model=TaskOut)
async def get_task(task_id: str):
    try:
        obj_id = ObjectId(task_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID không hợp lệ")
 
    task = await tasks_collection.find_one({"_id": obj_id})
    if task is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy task")
    return task_helper(task)
 
 
# ---------- UPDATE ----------
@app.put("/api/tasks/{task_id}", response_model=TaskOut)
async def update_task(task_id: str, task: TaskUpdate):
    try:
        obj_id = ObjectId(task_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID không hợp lệ")
 
    update_data = {k: v for k, v in task.model_dump().items() if v is not None}
 
    if update_data:
        result = await tasks_collection.update_one(
            {"_id": obj_id}, {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Không tìm thấy task")
 
    updated = await tasks_collection.find_one({"_id": obj_id})
    return task_helper(updated)
 
 
# ---------- DELETE ----------
@app.delete("/api/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: str):
    try:
        obj_id = ObjectId(task_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID không hợp lệ")
 
    result = await tasks_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy task")
    return None


# ---------- REGISTER ----------
@app.post("/register", response_model=UserOut)
async def register(user: UserCreate):
    # kiểm tra xem email đã tồn tại trong MongoDB chưa
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email này đã được sử dụng!")

    # băm mật khẩu (Mật khẩu thô không bao giờ được lưu trực tiếp)
    hashed_pwd = pwd_context.hash(user.password)

    # đóng gói dữ liệu để LƯU VĨNH VIỄN vào MongoDB Atlas
    user_dict = {
        "email": user.email,
        "password_hash": hashed_pwd, # lưu bản băm
        "full_name": user.full_name,
        "role": user.role,
        "created_at": datetime.now()
    }
    
    # Lệnh này đẩy dữ liệu lên cơ sở dữ liệu MongoDB đám mây
    result = await users_collection.insert_one(user_dict)
    
    user_dict["_id"] = str(result.inserted_id)
    return user_dict


# ---------- LOGIN ----------
@app.post("/login")
async def login(user_credentials: UserLogin):
    # tìm tài khoản trong MongoDB xem đã từng đăng ký chưa
    db_user = await users_collection.find_one({"email": user_credentials.email})
    if not db_user:
        raise HTTPException(status_code=400, detail="Sai email hoặc mật khẩu!")

    # so sánh mật khẩu nhập vào với mật khẩu đã lưu trong MongoDB
    is_password_correct = pwd_context.verify(user_credentials.password, db_user["password_hash"])
    if not is_password_correct:
        raise HTTPException(status_code=400, detail="Sai email hoặc mật khẩu!")

    # đăng nhập thành công sẽ Trả về thông báo hoặc token
    return {"message": "Đăng nhập thành công!", "user_id": str(db_user["_id"])}

# ---------- LOGOUT ----------
@app.post("/logout")
async def logout(response: Response):
    # Xóa Cookie lưu token trên trình duyệt người dùng
    response.delete_cookie(
        key="access_token",
        httponly=True,
        samesite="lax",
        secure=False # đổi thành True khi chạy HTTPS thực tế
    )
    return {"message": "Đăng xuất thành công!"}