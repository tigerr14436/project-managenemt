"""FastAPI router xác minh email bằng OTP; dùng models.User, models.EmailVerification."""
import asyncio
import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User, EmailVerification
from email_service import send_verification_email

load_dotenv()
router = APIRouter(prefix='/api/auth', tags=['Email verification'])
OTP_LIFETIME = timedelta(minutes=5)
RESEND_COOLDOWN = timedelta(seconds=60)
MAX_ATTEMPTS = 5

class VerifyEmailIn(BaseModel):
    email: EmailStr
    code: str = Field(pattern=r'^\d{6}$')

class ResendCodeIn(BaseModel):
    email: EmailStr


def normalize_email(email: str) -> str:
    return str(email).strip().lower()


def otp_digest(email: str, code: str) -> str:
    pepper = os.getenv('OTP_PEPPER', '')
    if len(pepper) < 32:
        raise RuntimeError('OTP_PEPPER phải có ít nhất 32 ký tự ngẫu nhiên')
    return hashlib.sha256(f'{pepper}:{email}:{code}'.encode()).hexdigest()


async def issue_code(db: AsyncSession, user: User, *, enforce_cooldown: bool = True) -> None:
    now = datetime.now(timezone.utc)
    record = await db.scalar(select(EmailVerification).where(EmailVerification.user_id == user.id))
    if record and enforce_cooldown and record.sent_at and now - record.sent_at.astimezone(timezone.utc) < RESEND_COOLDOWN:
        raise HTTPException(429, 'Vui lòng chờ 60 giây trước khi gửi lại mã')
    code = f'{secrets.randbelow(1_000_000):06d}'
    if record is None:
        record = EmailVerification(user_id=user.id, code_hash=otp_digest(user.email, code), expires_at=now + OTP_LIFETIME, sent_at=now, attempts=0)
        db.add(record)
    else:
        record.code_hash = otp_digest(user.email, code)
        record.expires_at = now + OTP_LIFETIME
        record.sent_at = now
        record.attempts = 0
    await db.commit()
    try:
        await asyncio.to_thread(send_verification_email, user.email, code)
    except Exception as exc:
        # Không để lại mã OTP mà người dùng không nhận được; có thể thử lại.
        await db.delete(record)
        await db.commit()
        raise HTTPException(503, 'Không gửi được email. Kiểm tra cấu hình Gmail SMTP và thử lại.') from exc


@router.post('/verify-email')
async def verify_email(payload: VerifyEmailIn, db: AsyncSession = Depends(get_db)):
    email = normalize_email(payload.email)
    user = await db.scalar(select(User).where(User.email == email))
    if user is None or user.is_verified:
        raise HTTPException(400, 'Email hoặc mã xác minh không hợp lệ')
    record = await db.scalar(select(EmailVerification).where(EmailVerification.user_id == user.id).with_for_update())
    now = datetime.now(timezone.utc)
    if record is None or record.expires_at.astimezone(timezone.utc) < now:
        raise HTTPException(400, 'Mã đã hết hạn. Vui lòng yêu cầu gửi lại')
    if record.attempts >= MAX_ATTEMPTS:
        raise HTTPException(429, 'Bạn đã nhập sai quá số lần cho phép. Vui lòng gửi lại mã')
    if not secrets.compare_digest(record.code_hash, otp_digest(email, payload.code)):
        record.attempts += 1
        await db.commit()
        raise HTTPException(400, 'Mã xác minh không đúng')
    user.is_verified = True
    await db.delete(record)
    await db.commit()
    return {'message': 'Email đã được xác minh. Bạn có thể đăng nhập.'}


@router.post('/resend-verification')
async def resend_verification(payload: ResendCodeIn, db: AsyncSession = Depends(get_db)):
    email = normalize_email(payload.email)
    user = await db.scalar(select(User).where(User.email == email))
    if user is not None and not user.is_verified:
        await issue_code(db, user)
    return {'message': 'Nếu tài khoản chưa xác minh, mã mới sẽ được gửi đến email.'}
