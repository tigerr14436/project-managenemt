Website Quản Lý Công Việc & Dự Án CNTT

Đồ án môn học - Website quản lý công việc & dự án theo mô hình Agile/Scrum.

Công nghệ sử dụng
Frontend: React, Axios, Ant Design/Tailwind, Recharts
Backend: Python, FastAPI, Motor (MongoDB driver)
Database: MongoDB Atlas
Xác thực: JWT
Yêu cầu cài đặt trước

Trước khi bắt đầu, cần cài các phần mềm sau trên máy:

Python 3.10+
Node.js 18+ (kèm npm)
Git
Một trình soạn code, khuyên dùng VS Code
1. Clone repo về máy
bash
git clone https://github.com/tigerr14436/project-managenemt.git
cd project-managenemt
2. Cài đặt Backend (FastAPI)
bash
cd backend

Tạo môi trường ảo (khuyến khích, tránh xung đột thư viện):

bash
python -m venv venv

# Kích hoạt môi trường ảo
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

Cài các thư viện cần thiết:

bash
pip install -r requirements.txt

Nếu chưa có file requirements.txt, cài thủ công:

bash
pip install fastapi uvicorn motor python-dotenv pydantic
Cấu hình biến môi trường

File .env chứa chuỗi kết nối MongoDB Atlas đã có sẵn trong repo (dùng chung cho cả nhóm). Nếu bạn không thấy file này, liên hệ trưởng nhóm để lấy, rồi tạo file backend/.env với nội dung:

MONGO_URI=<hỏi trưởng nhóm để lấy chuỗi kết nối>
Chạy Backend
bash
uvicorn main:app --reload --port 8000

Kiểm tra API đã chạy: mở trình duyệt vào http://127.0.0.1:8000/docs

3. Cài đặt Frontend (React)

Mở terminal mới (giữ terminal backend đang chạy), rồi:

bash
cd frontend
npm install
npm start

Ứng dụng React sẽ chạy tại http://localhost:3000

4. Cấu trúc thư mục
project-managenemt/
├── backend/
│   ├── main.py          # File chạy server, chứa các API endpoint
│   ├── database.py      # Kết nối MongoDB Atlas
│   ├── models.py        # Định nghĩa cấu trúc dữ liệu (Pydantic)
│   ├── .env              # Biến môi trường (chuỗi kết nối DB)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
5. Quy trình làm việc nhóm (Git)

Trước khi bắt đầu code mỗi ngày, luôn cập nhật code mới nhất:

bash
git pull

Sau khi code xong một phần việc:

bash
git add .
git commit -m "mô tả ngắn gọn thay đổi"
git push

Khuyến khích mỗi người tạo nhánh (branch) riêng khi làm tính năng mới, tránh đè code lên nhau:

bash
git checkout -b ten-nhanh-cua-ban
Thành viên nhóm
Tên	Vai trò
Hoàng Nghĩa Hùng	Nhóm trưởng, thiết kế hệ thống + Backend Python
Chướng Và Kiệt	Frontend React
Lê Đình Hoàng	MongoDB + tài liệu/báo cáo
Phạm Tường Di	MongoDB + tài liệu/báo cáo
Gặp lỗi?
Backend không chạy được → kiểm tra đã cd backend đúng thư mục chưa, và đã cài đủ thư viện chưa
Lỗi kết nối MongoDB (bad auth) → kiểm tra lại MONGO_URI trong file .env
Frontend không gọi được API → kiểm tra backend đã chạy ở port 8000 chưa, và CORS đã cho phép localhost:3000 chưa
