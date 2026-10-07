# 🚀 DevTask - Website Quản Lý Công Việc & Dự Án CNTT

## 📌 Giới thiệu

**DevTask** là ứng dụng web hỗ trợ quản lý công việc và dự án dành cho các nhóm phát triển phần mềm.

Hệ thống được xây dựng nhằm hỗ trợ các thành viên trong nhóm quản lý công việc, theo dõi tiến độ dự án, tổ chức Workspace và quản lý thành viên trong quá trình phát triển phần mềm.

Dự án được thực hiện theo định hướng **Agile/Scrum**, trong đó các chức năng được phát triển và hoàn thiện qua từng Sprint.

---

## 🎯 Mục tiêu của hệ thống

DevTask hướng đến các chức năng chính:

- Đăng ký tài khoản người dùng.
- Đăng nhập và xác thực bằng JWT.
- Quản lý thông tin người dùng.
- Quản lý công việc (Task).
- Tạo, xem, cập nhật và xóa công việc.
- Theo dõi trạng thái công việc.
- Quản lý mức độ ưu tiên của công việc.
- Quản lý người phụ trách công việc.
- Quản lý dự án.
- Quản lý Workspace và nhóm làm việc.
- Quản lý thành viên trong Workspace.
- Hỗ trợ theo dõi tiến độ dự án.

Một số chức năng Project và Workspace hiện đang tiếp tục được hoàn thiện trong các Sprint tiếp theo.

---

# 🛠 Công nghệ sử dụng

## Frontend

- React
- Vite
- React Router
- JavaScript
- Fetch API
- Lucide React
- CSS

## Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn

## Database

- PostgreSQL

## Authentication

- JSON Web Token (JWT)
- Passlib
- Bcrypt
- Python-JOSE

---

# 📂 Cấu trúc dự án

```text
project-managenemt/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── auth_utils.py
│   ├── auth_deps.py
│   ├── .env
│   └── ...
│
├── frontend/
│   ├── lib/
│   │   └── api.js
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── Auth/
│   │   │   ├── DashBoard/
│   │   │   ├── Projects/
│   │   │   └── Workspaces/
│   │   │
│   │   ├── routes/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

---

# ⚙️ Yêu cầu trước khi cài đặt

Trước khi chạy dự án, máy tính cần cài đặt các phần mềm sau.

## 1. Git

Git được sử dụng để tải source code từ GitHub.

Kiểm tra Git:

```bash
git --version
```

Nếu lệnh trả về phiên bản Git thì Git đã được cài đặt.

---

## 2. Python

Backend sử dụng Python.

Khuyến nghị:

```text
Python 3.10 trở lên
```

Kiểm tra:

```bash
python --version
```

hoặc:

```bash
py --version
```

---

## 3. Node.js và npm

Frontend React/Vite cần Node.js.

Khuyến nghị:

```text
Node.js 18 trở lên
```

Kiểm tra:

```bash
node --version
npm --version
```

---

## 4. PostgreSQL

Dự án sử dụng PostgreSQL để lưu dữ liệu.

Cần cài:

```text
PostgreSQL
```

Có thể sử dụng **pgAdmin 4** để quản lý database trực quan.

---

## 5. Visual Studio Code

Khuyến nghị sử dụng VS Code để mở và chỉnh sửa source code.

Đây không phải yêu cầu bắt buộc. Có thể sử dụng IDE khác nếu muốn.

---

# 📥 1. Tải source code từ GitHub

Mở Terminal, PowerShell hoặc Command Prompt và chạy:

```bash
git clone https://github.com/tigerr14436/project-managenemt.git
```

Sau đó truy cập thư mục:

```bash
cd project-managenemt
```

---

# 🗄️ 2. Cấu hình PostgreSQL

Sau khi cài PostgreSQL, tạo một database cho dự án.

Ví dụ:

```sql
CREATE DATABASE project_management;
```

Thông tin database ví dụ:

```text
Host: localhost
Port: 5432
Database: project_management
Username: postgres
Password: mật khẩu PostgreSQL của bạn
```

---

# 🔐 3. Cấu hình biến môi trường Backend

Truy cập thư mục:

```bash
cd backend
```

Tạo file:

```text
.env
```

Ví dụ nội dung:

```env
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/project_management

JWT_SECRET_KEY=YOUR_SECRET_KEY
```

Thay:

```text
YOUR_PASSWORD
```

bằng mật khẩu PostgreSQL trên máy.

Thay:

```text
YOUR_SECRET_KEY
```

bằng một chuỗi bí mật dùng để ký JWT.

Ví dụ môi trường phát triển:

```env
DATABASE_URL=postgresql+asyncpg://postgres:123456@localhost:5432/project_management

JWT_SECRET_KEY=devtask-local-secret-key
```

> Không nên đưa file `.env` thật lên GitHub vì file này có thể chứa mật khẩu database và khóa JWT.

---

# 🐍 4. Cài đặt Backend

Từ thư mục:

```text
project-managenemt/backend
```

Tạo môi trường ảo Python:

```bash
python -m venv venv
```

## Windows

Kích hoạt môi trường:

```bash
venv\Scripts\activate
```

## macOS/Linux

```bash
source venv/bin/activate
```

Sau khi kích hoạt thành công, terminal thường hiển thị:

```text
(venv)
```

---

# 📦 5. Cài thư viện Backend

Nếu dự án có `requirements.txt`:

```bash
pip install -r requirements.txt
```

Nếu chưa có `requirements.txt`, có thể cài các thư viện cần thiết:

```bash
pip install fastapi uvicorn sqlalchemy asyncpg pydantic email-validator python-dotenv python-jose passlib bcrypt
```

Các thư viện chính:

| Thư viện | Chức năng |
|---|---|
| FastAPI | Xây dựng REST API |
| Uvicorn | Chạy FastAPI server |
| SQLAlchemy | ORM làm việc với database |
| asyncpg | Kết nối PostgreSQL bất đồng bộ |
| Pydantic | Kiểm tra dữ liệu request/response |
| email-validator | Kiểm tra định dạng email |
| python-dotenv | Đọc biến môi trường `.env` |
| python-jose | Tạo và xác thực JWT |
| passlib | Xử lý mã hóa mật khẩu |
| bcrypt | Hash mật khẩu |

---

# ▶️ 6. Chạy Backend

Đảm bảo Terminal đang ở:

```text
project-managenemt/backend
```

Chạy:

```bash
uvicorn main:app --reload --port 8000
```

Nếu thành công sẽ xuất hiện thông báo tương tự:

```text
Uvicorn running on http://127.0.0.1:8000
```

Backend chạy tại:

```text
http://127.0.0.1:8000
```

FastAPI Swagger:

```text
http://127.0.0.1:8000/docs
```

Có thể sử dụng Swagger để kiểm thử trực tiếp các API.

---

# ⚛️ 7. Cài đặt Frontend

Giữ Terminal backend đang chạy.

Mở **Terminal mới**.

Trở về thư mục dự án và truy cập frontend:

```bash
cd frontend
```

Cài các package:

```bash
npm install
```

---

# ▶️ 8. Chạy Frontend

Chạy:

```bash
npm run dev
```

Vite sẽ hiển thị địa chỉ tương tự:

```text
http://localhost:5173
```

Mở trình duyệt và truy cập:

```text
http://localhost:5173
```

---

# 🔗 9. Kết nối Frontend với Backend

Frontend hiện gọi Backend tại:

```text
http://127.0.0.1:8000/api
```

Backend FastAPI cho phép frontend Vite:

```text
http://localhost:5173
```

gọi API thông qua cấu hình CORS.

Vì vậy khi chạy dự án cần chạy đồng thời:

```text
Frontend
http://localhost:5173

        ↓ HTTP Request

Backend FastAPI
http://127.0.0.1:8000

        ↓

PostgreSQL
localhost:5432
```

---

# 🔐 10. Cơ chế đăng nhập JWT

Khi người dùng đăng nhập:

```text
Frontend
   ↓
POST /api/auth/login
   ↓
FastAPI
   ↓
Kiểm tra tài khoản trong PostgreSQL
   ↓
Kiểm tra mật khẩu
   ↓
Tạo JWT Access Token
   ↓
Trả token cho Frontend
```

Frontend lưu token:

```javascript
localStorage.setItem('access_token', data.access_token);
```

Khi gọi API yêu cầu đăng nhập, frontend gửi:

```http
Authorization: Bearer <access_token>
```

Backend kiểm tra JWT trước khi cho phép truy cập tài nguyên được bảo vệ.

---

# 📡 11. Các API chính

## Authentication

### Đăng ký

```http
POST /api/auth/register
```

Ví dụ:

```json
{
  "name": "Nguyen Van A",
  "email": "nguyenvana@gmail.com",
  "password": "Password123"
}
```

### Đăng nhập

```http
POST /api/auth/login
```

```json
{
  "email": "nguyenvana@gmail.com",
  "password": "Password123"
}
```

Nếu thành công:

```json
{
  "access_token": "...",
  "token_type": "bearer"
}
```

---

# 👤 12. User API

Lấy thông tin tài khoản hiện tại:

```http
GET /api/users/me
```

Cập nhật thông tin:

```http
PUT /api/users/me
```

Các API này yêu cầu JWT.

---

# ✅ 13. Task API

Tạo công việc:

```http
POST /api/tasks
```

Lấy danh sách:

```http
GET /api/tasks
```

Lấy một công việc:

```http
GET /api/tasks/{task_id}
```

Cập nhật:

```http
PUT /api/tasks/{task_id}
```

Xóa:

```http
DELETE /api/tasks/{task_id}
```

Ví dụ Task:

```json
{
  "title": "Hoàn thiện API đăng nhập",
  "description": "Kết nối frontend với backend",
  "status": "in_progress",
  "priority": "high",
  "deadline": "2026-10-15T23:59:00",
  "assignee": "Hoàng Nghĩa Hùng"
}
```

---

# 🧪 14. Kiểm tra API bằng Swagger

Sau khi Backend chạy, truy cập:

```text
http://127.0.0.1:8000/docs
```

Swagger cho phép:

- Test Register.
- Test Login.
- Test User API.
- Test CRUD Task.
- Xem request/response.
- Kiểm tra HTTP Status Code.
- Kiểm tra lỗi validation.

Đối với API yêu cầu JWT:

1. Đăng nhập bằng `/api/auth/login`.
2. Copy `access_token`.
3. Chọn **Authorize** trong Swagger.
4. Nhập token.
5. Gọi API cần xác thực.

---

# ❗ 15. Một số lỗi thường gặp

## Backend báo lỗi kết nối PostgreSQL

Kiểm tra:

```env
DATABASE_URL
```

Đảm bảo:

- PostgreSQL đang chạy.
- Username đúng.
- Password đúng.
- Database đã được tạo.
- Port mặc định là `5432`.

---

## Frontend không gọi được Backend

Kiểm tra Backend có đang chạy:

```text
http://127.0.0.1:8000/docs
```

Sau đó kiểm tra frontend đang chạy đúng:

```text
http://localhost:5173
```

---

## Lỗi ModuleNotFoundError

Ví dụ:

```text
ModuleNotFoundError: No module named 'fastapi'
```

Kích hoạt lại môi trường:

```bash
venv\Scripts\activate
```

Sau đó:

```bash
pip install -r requirements.txt
```

---

## Port 8000 đang được sử dụng

Có thể chạy backend bằng port khác:

```bash
uvicorn main:app --reload --port 8001
```

Nếu đổi port backend, cần cập nhật URL API bên frontend.

---

# 🔄 16. Cập nhật source code mới nhất

Trước khi bắt đầu làm việc:

```bash
git pull
```

Sau khi hoàn thành chức năng:

```bash
git add .
git commit -m "Mô tả chức năng đã thực hiện"
git push
```

---

# 🌿 17. Quy trình làm việc nhóm

Khuyến nghị mỗi thành viên sử dụng branch riêng:

```bash
git checkout -b ten-branch
```

Ví dụ:

```bash
git checkout -b feature-task
```

Sau khi hoàn thành:

```bash
git add .
git commit -m "Hoàn thiện chức năng Task"
git push origin feature-task
```

Sau đó tạo Pull Request để merge vào branch `main`.

---

# 👥 Thành viên nhóm

| Thành viên | Vai trò |
|---|---|
| Hoàng Nghĩa Hùng | Nhóm trưởng, thiết kế hệ thống, Backend Python |
| Chướng Và Kiệt | Frontend React |
| Lê Đình Hoàng | Database, tài liệu |
| Phạm Tường Di | Database, tài liệu |

---

# 📈 Trạng thái phát triển

### Đã thực hiện

- [x] Giao diện React
- [x] Đăng ký tài khoản
- [x] Đăng nhập
- [x] Hash mật khẩu
- [x] JWT Authentication
- [x] API thông tin người dùng
- [x] CRUD Task
- [x] Giao diện Project
- [x] Giao diện Workspace

### Đang phát triển

- [ ] Kết nối hoàn chỉnh Project với Backend
- [ ] Kết nối hoàn chỉnh Workspace với Backend
- [ ] Quản lý thành viên
- [ ] Phân quyền người dùng
- [ ] Liên kết Task với Project và User
- [ ] Hoàn thiện kiểm thử
- [ ] Dashboard thống kê tiến độ

---

# 📌 Thông tin dự án

**Tên dự án:** DevTask - Website Quản lý Công việc & Dự án CNTT

**Mô hình phát triển:** Agile/Scrum

**Frontend:** React + Vite

**Backend:** FastAPI

**Database:** PostgreSQL

**Authentication:** JWT

**Repository:**  
https://github.com/tigerr14436/project-managenemt
