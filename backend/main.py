from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from bson.errors import InvalidId
 
from database import tasks_collection
from models import TaskCreate, TaskUpdate, TaskOut
 
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
 
 
@app.get("/")
async def root():
    return {"message": "API đang chạy. Vào /docs để xem tài liệu API."}
 