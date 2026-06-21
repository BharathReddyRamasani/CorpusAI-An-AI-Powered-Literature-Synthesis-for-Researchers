import asyncio
from app.db.sqlite import AsyncSessionLocal
from app.models.user import User
from app.services.auth_service import hash_password, verify_password
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        # Create user directly
        email = "debug_user@example.com"
        password = "MySecurePassword123"
        hashed = hash_password(password)
        
        print(f"Hashed password length: {len(hashed)}")
        print(f"Hashed password: {hashed}")
        print(f"Verification before save: {verify_password(password, hashed)}")
        
        user = User(name="Debug User", email=email, password_hash=hashed, is_verified=True)
        db.add(user)
        await db.commit()
        
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        print(f"Retrieved user: {user.email}")
        print(f"Retrieved hash: {user.password_hash}")
        print(f"Retrieved hash length: {len(user.password_hash)}")
        print(f"Verification after save: {verify_password(password, user.password_hash)}")

if __name__ == "__main__":
    asyncio.run(main())
