"""
Dependency dùng chung: xác định user đang đăng nhập từ JWT token.
Đặt file này trong thư mục /backend.

Cách dùng trong 1 endpoint cần đăng nhập:
    from auth_deps import get_current_user

    @app.get("/api/something")
    async def my_endpoint(current_user: User = Depends(get_current_user)):
        ...
"""

import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User
from auth_utils import decode_access_token

# HTTPBearer hiển thị đúng 1 ô "Value" để dán access_token vào,
# khác với OAuth2PasswordBearer (yêu cầu form username/password không phù hợp
# vì endpoint /api/auth/login của mình nhận JSON, không phải form OAuth2 chuẩn).
bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token không hợp lệ hoặc đã hết hạn",
    )

    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise unauthorized

    user_id = payload.get("sub")
    if user_id is None:
        raise unauthorized

    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise unauthorized

    user = await db.get(User, user_uuid)
    if user is None:
        raise unauthorized

    return user