import asyncio
from database import db
 
 
async def test():
    try:
        # Lấy danh sách collections hiện có trong database
        collections = await db.list_collection_names()
        print("✅ Kết nối MongoDB Atlas thành công!")
        print("📂 Danh sách collections hiện có:", collections)
 
        # Thử ping server để chắc chắn kết nối ổn định
        await db.command("ping")
        print("✅ Ping server thành công!")
 
    except Exception as e:
        print("❌ Kết nối thất bại. Lỗi chi tiết:")
        print(e)
        print("\n👉 Kiểm tra lại:")
        print("  1. MONGO_URI trong file .env đã đúng chưa (username/password)")
        print("  2. Đã whitelist IP ở Network Access trên MongoDB Atlas chưa")
        print("  3. Nếu password có ký tự đặc biệt (@, #, %...) đã encode URL chưa")
 
 
if __name__ == "__main__":
    asyncio.run(test())