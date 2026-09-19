from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
 
# Đọc các biến môi trường từ file .env
load_dotenv()
 
MONGO_URI = os.getenv("MONGO_URI")
 
if not MONGO_URI:
    raise ValueError(
        "Không tìm thấy MONGO_URI. Kiểm tra lại:\n"
        "1. File .env có đúng tên '.env' không (không phải 'file.env')\n"
        "2. File .env có nằm cùng thư mục với database.py không\n"
        "3. Trong .env đã có dòng MONGO_URI=... chưa"
    )
 
# Tạo client kết nối tới MongoDB Atlas
client = AsyncIOMotorClient(MONGO_URI)
 
# Chọn database (đổi tên "quanlydu_an" nếu bạn muốn dùng tên khác)
db = client["quanlydu_an"]
 
# Khai báo các collection sẽ dùng trong đồ án
users_collection = db["users"]
tasks_collection = db["tasks"]
projects_collection = db["projects"]
workspaces_collection = db["workspaces"]