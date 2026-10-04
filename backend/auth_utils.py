"""
Các hàm tiện ích cho xác thực: mã hóa mật khẩu, tạo/giải mã JWT token.
Đặt file này trong thư mục /backend.
"""

import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

# Khóa bí mật để ký JWT — nên đặt trong .env, ở đây có giá trị mặc định để chạy ngay
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "doi-chuoi-nay-truoc-khi-nop-bai-nhe")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # token sống 7 ngày

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Mã hóa mật khẩu trước khi lưu vào database"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """So sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa trong DB"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    """Tạo JWT token chứa thông tin user (ví dụ user id)"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """Giải mã token, trả về None nếu token không hợp lệ/hết hạn"""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None