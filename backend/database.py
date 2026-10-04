"""
File kết nối PostgreSQL bằng SQLAlchemy (async).
Đặt file này trong thư mục /backend, cùng cấp với file .env
"""

import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(
        "Không tìm thấy DATABASE_URL trong file .env.\n"
        "Ví dụ: DATABASE_URL=postgresql+asyncpg://postgres:matkhau@localhost:5432/quanlydu_an"
    )

# echo=True sẽ in ra toàn bộ câu lệnh SQL thực thi, hữu ích khi debug.
# Có thể đổi thành False khi không cần xem log nữa.
engine = create_async_engine(DATABASE_URL, echo=True)

# Mỗi request sẽ mở 1 session riêng để thao tác với database
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

# Base class để các model (bảng) kế thừa
Base = declarative_base()


async def get_db():
    """Dependency dùng trong FastAPI để lấy session DB cho mỗi request"""
    async with AsyncSessionLocal() as session:
        yield session