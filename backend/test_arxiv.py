import asyncio
from app.db.sqlite import AsyncSessionLocal
from app.services.advanced_research_service import get_semantic_recommendations

async def main():
    try:
        async with AsyncSessionLocal() as db:
            res = await get_semantic_recommendations(db, 1)
            print("Success:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(main())
