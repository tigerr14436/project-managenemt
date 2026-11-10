# DevTask – Project Management System

<p align="center">

**Hệ thống quản lý dự án, công việc và cộng tác nhóm tích hợp trí tuệ nhân tạo**

</p>

DevTask là hệ thống quản lý dự án và công việc dành cho các nhóm phát triển phần mềm. Hệ thống hỗ trợ quản lý thành viên, phân công nhiệm vụ, theo dõi tiến độ, quản lý chi phí và ứng dụng AI để hỗ trợ chủ dự án trong quá trình lập kế hoạch và điều hành dự án.

## 1. Giới thiệu dự án

### Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | ReactJS, Vite |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy (Async) |
| Database Driver | asyncpg |
| Authentication | JWT |
| Password Hashing | Passlib, bcrypt |
| Email | Gmail SMTP |
| AI Provider | Ollama |
| AI Model | qwen2.5:7b-instruct-q4_K_M |

### Các chức năng chính

- Quản lý tài khoản, đăng ký, đăng nhập và xác thực email OTP.
- Quản lý dự án và thành viên tham gia.
- Quản lý nhóm làm việc trong từng dự án.
- Quản lý công việc, phân công và theo dõi tiến độ.
- Kanban Board hỗ trợ quản lý trạng thái công việc.
- Phân quyền người dùng theo vai trò và quyền hạn.
- Quản lý chi phí và ngân sách dự án.
- Chat AI hỗ trợ các hoạt động trong dự án.
- Owner AI phân tích thông tin dự án và chi phí.
- Owner AI đề xuất tạo nhóm, công việc và phân công nhiệm vụ.
- Người quản lý xem xét và phê duyệt đề xuất trước khi hệ thống thực hiện.

## 2. Yêu cầu hệ thống

Trước khi cài đặt, cần chuẩn bị:

| Phần mềm | Mục đích |
|---|---|
| Git | Clone source code |
| Python | Chạy Backend |
| Node.js và npm | Chạy Frontend |
| PostgreSQL | Lưu trữ dữ liệu |
| Ollama | Chạy mô hình AI trên máy tính |
| VS Code (khuyến nghị) | Môi trường phát triển |

Kiểm tra các công cụ đã được cài đặt bằng PowerShell:

```powershell
git --version
python --version
node --version
npm --version
psql --version
```

Nếu chưa có một trong các công cụ trên, hãy cài đặt trước khi tiếp tục.

## 3. Clone source code từ GitHub

Mở PowerShell hoặc Terminal và chạy:

```powershell
git clone https://github.com/tigerr14436/project-managenemt.git
```

Di chuyển vào thư mục dự án:

```powershell
cd project-managenemt
```

Mở dự án bằng VS Code:

```powershell
code .
```

Cấu trúc thư mục chính:

```text
project-managenemt/
│
├── backend/
│   ├── ai/
│   ├── routers/
│   ├── services/
│   ├── models/
│   ├── .env.example
│   ├── main.py
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── setup_devtask.bat
├── .gitignore
└── README.md
```

Lưu ý: Cấu trúc trên minh họa các thành phần chính, một số thư mục có thể thay đổi theo phiên bản source code.

## 4. Cài đặt thư viện dự án

### 4.1. Cài đặt Backend

Tại thư mục gốc dự án, chạy:

```powershell
.\setup_devtask.bat
```

Script này hỗ trợ kiểm tra môi trường Python, Node.js, npm, tạo môi trường ảo Python tại `backend/.venv` và cài đặt các thư viện Backend.

Các thư viện chính:

| Thư viện | Chức năng |
|---|---|
| FastAPI | Xây dựng REST API |
| Uvicorn | Chạy máy chủ Backend |
| SQLAlchemy | ORM và truy vấn cơ sở dữ liệu |
| asyncpg | Kết nối PostgreSQL bất đồng bộ |
| Pydantic | Kiểm tra và xử lý dữ liệu |
| email-validator | Kiểm tra địa chỉ email |
| python-dotenv | Đọc biến môi trường |
| python-jose | Xử lý JWT |
| Passlib | Mã hóa và kiểm tra mật khẩu |
| bcrypt | Password hashing |
| HTTPX | Gửi HTTP request đến AI Provider |

**Nếu không sử dụng file setup_devtask.bat**, có thể thiết lập môi trường thủ công:

```powershell
cd backend

python -m venv .venv

.\.venv\Scripts\Activate.ps1
```

Sau đó cài đặt các thư viện theo danh sách dependency của phiên bản source code.

Lưu ý: Dự án sử dụng Passlib 1.7.4 và bcrypt 4.0.1 để tránh lỗi tương thích đã gặp ở một số phiên bản bcrypt mới hơn.

### 4.2. Cài đặt Frontend

Mở Terminal mới hoặc quay lại thư mục gốc:

```powershell
cd frontend
```

Cài đặt thư viện:

```powershell
npm install
```

Sau khi hoàn tất, quay lại thư mục gốc:

```powershell
cd ..
```

## 5. Cài đặt và cấu hình PostgreSQL

DevTask sử dụng PostgreSQL để lưu trữ tài khoản, dự án, công việc, thành viên, chi phí và dữ liệu AI.

### Bước 1: Cài đặt PostgreSQL

Tải PostgreSQL tại:

https://www.postgresql.org/download/

Trong quá trình cài đặt, cần lưu lại:

- Username PostgreSQL.
- Password PostgreSQL.
- Port kết nối (mặc định thường là 5432).

### Bước 2: Tạo database

Có thể sử dụng pgAdmin hoặc PostgreSQL Query Tool.

Tạo database có tên:

```sql
CREATE DATABASE project_management;
```

Tên database phải tương ứng với thông tin trong `DATABASE_URL`.

### Bước 3: Kiểm tra kết nối

Ví dụ kết nối PostgreSQL:

```text
postgresql://postgres:your_password@localhost:5432/project_management
```

Trong DevTask, SQLAlchemy sử dụng driver bất đồng bộ `asyncpg`, vì vậy cấu hình thực tế cần có dạng:

```text
postgresql+asyncpg://postgres:your_password@localhost:5432/project_management
```

Thay `your_password` bằng mật khẩu PostgreSQL trên máy của bạn.

Lưu ý: Đây chỉ là ví dụ. Không sử dụng nguyên mật khẩu mẫu.

## 6. Tạo và cấu hình file .env

Đây là bước quan trọng nhất để Backend có thể hoạt động.

Mỗi người clone dự án cần tự tạo file cấu hình riêng.

Vị trí:

```text
project-managenemt/
└── backend/
    └── .env
```

Nếu repository có file `backend/.env.example`, hãy sao chép thành `backend/.env`:

```powershell
Copy-Item backend\.env.example backend\.env
```

Nếu chưa có file mẫu, hãy tạo file `.env` trong thư mục `backend`.

### 6.1. Nội dung file .env

```env
# ==========================================
# DATABASE CONFIGURATION
# ==========================================

DATABASE_URL=postgresql+asyncpg://postgres:YOUR_DB_PASSWORD@localhost:5432/project_management

DATABASE_ECHO=false


# ==========================================
# JWT AUTHENTICATION
# ==========================================

JWT_SECRET_KEY=YOUR_JWT_SECRET_KEY


# ==========================================
# OTP SECURITY
# ==========================================

OTP_PEPPER=YOUR_OTP_PEPPER


# ==========================================
# GMAIL SMTP CONFIGURATION
# ==========================================

SMTP_HOST=smtp.gmail.com

SMTP_PORT=587

SMTP_EMAIL=your_email@gmail.com

SMTP_APP_PASSWORD=YOUR_GMAIL_APP_PASSWORD
```

Thay các giá trị mẫu bằng thông tin thực tế của từng người.

### 6.2. Cách lấy DATABASE_URL

DATABASE_URL là chuỗi kết nối giữa Backend và PostgreSQL.

Cấu trúc:

```text
postgresql+asyncpg://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

Ví dụ:

```text
postgresql+asyncpg://postgres:123456@localhost:5432/project_management
```

Giải thích:

| Thành phần | Ý nghĩa |
|---|---|
| postgresql+asyncpg | Database và driver |
| postgres | Username PostgreSQL |
| 123456 | Mật khẩu ví dụ |
| localhost | Máy chủ database |
| 5432 | Port PostgreSQL |
| project_management | Tên database |

Nếu sử dụng máy chủ PostgreSQL khác, cần thay HOST, PORT, USERNAME và PASSWORD tương ứng.

**Lưu ý:** Nếu mật khẩu chứa ký tự đặc biệt như `@`, `#`, `/` hoặc `%`, cần URL-encode các ký tự đó trước khi đưa vào chuỗi kết nối.

### 6.3. Cách tạo JWT_SECRET_KEY

JWT_SECRET_KEY được sử dụng để ký và xác minh JWT Token.

Mỗi người nên tạo một khóa riêng.

Mở PowerShell:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

Kết quả sẽ là một chuỗi ngẫu nhiên.

Ví dụ:

```env
JWT_SECRET_KEY=chuoi_ngau_nhien_duoc_tao_tren_may
```

Không sử dụng khóa mẫu hoặc chia sẻ khóa bí mật giữa các thành viên.

### 6.4. Cách tạo OTP_PEPPER

OTP_PEPPER là khóa bí mật bổ sung được sử dụng trong quá trình bảo vệ dữ liệu OTP.

Tạo một chuỗi ngẫu nhiên bằng Python:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

Sao chép kết quả vào:

```env
OTP_PEPPER=chuoi_ngau_nhien_duoc_tao_tren_may
```

Không sử dụng chung OTP_PEPPER giữa các môi trường khác nhau.

### 6.5. Cách lấy SMTP_EMAIL và SMTP_APP_PASSWORD

DevTask sử dụng Gmail SMTP để gửi mã OTP xác thực email khi người dùng đăng ký tài khoản.

Bạn cần có một tài khoản Gmail riêng để gửi email.

**Bước 1: Chuẩn bị Gmail**

Truy cập:

https://myaccount.google.com/

Đăng nhập tài khoản Gmail muốn sử dụng để gửi OTP.

**Bước 2: Bật xác minh 2 bước**

Truy cập:

https://myaccount.google.com/security

Tìm mục xác minh 2 bước và thiết lập theo hướng dẫn của Google.

**Bước 3: Tạo App Password**

Truy cập:

https://myaccount.google.com/apppasswords

Nếu tài khoản đủ điều kiện sử dụng, tạo một App Password mới.

Google sẽ cung cấp một mật khẩu ứng dụng.

Đây là mật khẩu dùng riêng cho ứng dụng, không phải mật khẩu đăng nhập Gmail thông thường.

**Bước 4: Cấu hình vào .env**

Ví dụ:

```env
SMTP_HOST=smtp.gmail.com

SMTP_PORT=587

SMTP_EMAIL=example@gmail.com

SMTP_APP_PASSWORD=your_google_app_password
```

Trong đó:

- `SMTP_HOST`: Máy chủ SMTP của Gmail.
- `SMTP_PORT`: Cổng gửi email STARTTLS.
- `SMTP_EMAIL`: Địa chỉ Gmail gửi OTP.
- `SMTP_APP_PASSWORD`: Mật khẩu ứng dụng do Google cấp.

Không đưa mật khẩu Gmail hoặc App Password lên GitHub.

### 6.6. DATABASE_ECHO

Biến này điều khiển việc hiển thị câu lệnh SQL trong Terminal.

```env
DATABASE_ECHO=false
```

- `true`: Hiển thị các câu SQL khi truy vấn database, hữu ích khi debug.
- `false`: Không hiển thị các câu SQL, phù hợp khi chạy bình thường.

## 7. Cài đặt Ollama và mô hình AI

DevTask sử dụng Ollama để chạy mô hình ngôn ngữ trực tiếp trên máy tính.

Các chức năng AI cần Ollama đang hoạt động và có model tương ứng.

### Bước 1: Cài đặt Ollama

Truy cập:

https://ollama.com/download

Tải và cài đặt phiên bản dành cho Windows.

### Bước 2: Tải model

Mở PowerShell:

```powershell
ollama pull qwen2.5:7b-instruct-q4_K_M
```

Model này được sử dụng trong các chức năng AI của DevTask.

### Bước 3: Kiểm tra model

Chạy:

```powershell
ollama list
```

Nếu cài đặt thành công, danh sách sẽ hiển thị model:

```text
qwen2.5:7b-instruct-q4_K_M
```

### Bước 4: Kiểm tra Ollama

Ollama mặc định cung cấp API tại:

```text
http://localhost:11434
```

API chat:

```text
http://localhost:11434/api/chat
```

Nếu sử dụng cấu hình mặc định, không cần thay đổi URL trong source code.

**Lưu ý:** Model 7B cần tài nguyên RAM và bộ nhớ phù hợp. Tốc độ phản hồi phụ thuộc cấu hình máy tính. Không nên chạy đồng thời quá nhiều tác vụ nặng nếu máy không đủ tài nguyên.

## 8. Khởi chạy dự án

Sau khi hoàn thành các bước trên, có thể khởi chạy DevTask.

Cần mở ít nhất hai cửa sổ Terminal riêng biệt.

### Terminal 1: Chạy Backend

Di chuyển vào thư mục Backend:

```powershell
cd backend
```

Kích hoạt môi trường ảo:

```powershell
.\.venv\Scripts\Activate.ps1
```

Khởi chạy FastAPI:

```powershell
uvicorn main:app --reload
```

Nếu thành công, Backend chạy tại:

```text
http://127.0.0.1:8000
```

Tài liệu API:

```text
http://127.0.0.1:8000/docs
```

### Terminal 2: Chạy Frontend

Mở Terminal mới:

```powershell
cd project-managenemt/frontend
```

Chạy:

```powershell
npm run dev
```

Frontend mặc định sử dụng:

```text
http://localhost:5173
```

Nếu Vite hiển thị một port khác, hãy sử dụng địa chỉ được in trong Terminal.

### Kiểm tra toàn bộ hệ thống

| Thành phần | Địa chỉ |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://127.0.0.1:8000 |
| API Documentation | http://127.0.0.1:8000/docs |
| Ollama | http://localhost:11434 |

## 9. Hướng dẫn sử dụng sau khi chạy

Sau khi truy cập Frontend:

1. Đăng ký tài khoản mới.
2. Kiểm tra email để lấy mã OTP.
3. Xác thực tài khoản.
4. Đăng nhập vào hệ thống.
5. Tạo dự án mới.
6. Thêm thành viên và thiết lập nhóm.
7. Tạo công việc và phân công nhiệm vụ.
8. Theo dõi tiến độ thông qua Kanban Board.
9. Nhập và quản lý chi phí dự án.
10. Sử dụng AI để hỗ trợ phân tích dự án.

Đối với Owner AI:

- Chủ dự án cung cấp thông tin tổng quan dự án.
- AI đọc dữ liệu dự án và thông tin chi phí có sẵn.
- AI phân tích và đưa ra nhận xét.
- AI đề xuất công việc và nhóm chịu trách nhiệm.
- Chủ dự án kiểm tra, chỉnh sửa và phê duyệt đề xuất trước khi thực thi.

## 10. Một số lỗi thường gặp

### Lỗi 1: Không kết nối được PostgreSQL

Nguyên nhân có thể:

- PostgreSQL chưa chạy.
- Sai mật khẩu.
- Sai tên database.
- Sai port.
- DATABASE_URL không đúng định dạng.

Kiểm tra lại:

```env
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/project_management
```

### Lỗi 2: Backend báo thiếu biến môi trường

Ví dụ:

```text
DATABASE_URL is required
```

Nguyên nhân:

- Chưa tạo file `.env`.
- File `.env` đặt sai thư mục.
- Tên biến môi trường bị viết sai.

Đảm bảo file nằm tại:

```text
backend/.env
```

### Lỗi 3: Lỗi bcrypt

Nếu xuất hiện lỗi tương thích giữa Passlib và bcrypt, kiểm tra phiên bản đang cài:

```powershell
pip show passlib
pip show bcrypt
```

Phiên bản tương thích được sử dụng trong thiết lập dự án:

```text
passlib==1.7.4
bcrypt==4.0.1
```

### Lỗi 4: Không nhận được email OTP

Kiểm tra:

- SMTP_EMAIL có chính xác không.
- SMTP_APP_PASSWORD có phải App Password không.
- Tài khoản đã bật xác minh 2 bước chưa.
- SMTP_HOST và SMTP_PORT có chính xác không.
- Máy tính có kết nối Internet không.

### Lỗi 5: AI không phản hồi

Kiểm tra Ollama:

```powershell
ollama list
```

Nếu model chưa tồn tại:

```powershell
ollama pull qwen2.5:7b-instruct-q4_K_M
```

Kiểm tra Ollama có đang chạy không và địa chỉ API có đúng không:

```text
http://localhost:11434/api/chat
```

### Lỗi 6: Frontend không kết nối Backend

Kiểm tra Backend đã chạy chưa:

```text
http://127.0.0.1:8000/docs
```

Kiểm tra CORS trong Backend có cho phép Frontend:

```text
http://localhost:5173
http://127.0.0.1:5173
```

Đồng thời kiểm tra URL API được cấu hình trong Frontend.

## 11. Bảo mật và quản lý cấu hình

Để đảm bảo an toàn khi làm việc nhóm, cần tuân thủ:

- Không commit file `.env` lên GitHub.
- Không chia sẻ JWT_SECRET_KEY giữa các môi trường.
- Không chia sẻ OTP_PEPPER.
- Không đưa Gmail App Password lên repository.
- Không đưa mật khẩu PostgreSQL lên source code.
- Mỗi thành viên tự cấu hình database và tài khoản gửi email của mình.

Các file và thư mục cần được Git bỏ qua:

```gitignore
.env
.env.*
!.env.example

__pycache__/
*.pyc

.venv/
venv/

node_modules/
```

File `.env.example` chỉ chứa tên biến và giá trị minh họa, tuyệt đối không chứa thông tin bí mật thực tế.

## 12. Quy trình cập nhật source code

Khi có phiên bản mới trên GitHub, có thể cập nhật bằng:

```powershell
git pull origin main
```

Nếu có thay đổi thư viện Backend hoặc Frontend, cần cài đặt lại dependency tương ứng.

Backend: kích hoạt môi trường ảo và cài đặt các dependency mới theo cấu hình của repository.

Frontend:

```powershell
cd frontend
npm install
```

Sau đó khởi động lại các dịch vụ cần thiết.

---

## 13. Tổng kết

DevTask hướng đến việc xây dựng một nền tảng quản lý dự án tập trung, hỗ trợ cộng tác nhóm, quản lý công việc và chi phí, đồng thời tích hợp trí tuệ nhân tạo nhằm hỗ trợ chủ dự án đưa ra quyết định.

Dự án sử dụng mô hình triển khai Local, cho phép mỗi nhà phát triển tự thiết lập môi trường Backend, Frontend, PostgreSQL và Ollama trên máy tính cá nhân.

**GitHub Repository:**

https://github.com/tigerr14436/project-managenemt

**Chúc bạn cài đặt và trải nghiệm DevTask thành công!**
