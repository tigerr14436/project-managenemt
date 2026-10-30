"""Chạy trong backend: python backfill_name_tags.py"""
import asyncio
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from database import engine
from sqlalchemy.ext.asyncio import async_sessionmaker
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)
from models import User
from name_tags import generate_name_tag

async def main():
    async with AsyncSessionLocal() as db:
        ids = (await db.execute(select(User.id).where(User.name_tag.is_(None)))).scalars().all()
    for user_id in ids:
        for _ in range(50):
            async with AsyncSessionLocal() as db:
                user = await db.get(User, user_id)
                if not user or user.name_tag:
                    break
                user.name_tag = generate_name_tag()
                try:
                    await db.commit()
                    break
                except IntegrityError:
                    await db.rollback()
        else:
            raise RuntimeError("Không thể cấp mã duy nhất, cần tăng độ dài Name Tag.")
    print(f"Đã xử lý {len(ids)} tài khoản.")

if __name__ == "__main__":
    asyncio.run(main())
