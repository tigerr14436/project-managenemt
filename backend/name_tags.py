"""
backend/name_tags.py
Router Name Tag cho DevTask.
Yêu cầu: thêm User.name_tag vào models.py, migration SQL và include_router.
"""
import secrets
import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from database import get_db
from models import User
from auth_deps import get_current_user

router = APIRouter(prefix="/api/users", tags=["Name Tags"])
ALPHABET = string.ascii_uppercase + string.digits

def generate_name_tag():
    return "#" + "".join(secrets.choice(ALPHABET) for _ in range(4))

@router.get("/by-tag/{tag}")
async def find_user_by_tag(
    tag: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    normalized = "#" + tag.lstrip("#").upper()
    if len(normalized) != 5 or not normalized[1:].isalnum() or not normalized[1:].isascii():
        raise HTTPException(status_code=422, detail="Name Tag không hợp lệ")
    result = await db.execute(select(User).where(User.name_tag == normalized))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    # Không trả email, mật khẩu hoặc dữ liệu riêng tư.
    return {
        "id": str(user.id),
        "name": user.name,
        "name_tag": user.name_tag,
        "headline": "",
        "skills": [],
        "experiences": [],
        "projects": [],
        "education": []
    }
