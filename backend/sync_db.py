import asyncio
import logging
from app.db.sqlite import engine, Base
# Import all models to ensure metadata is registered
from app.models import __all__

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def sync():
    logger.info("Syncing database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database sync complete. Missing tables have been created.")

if __name__ == "__main__":
    asyncio.run(sync())
