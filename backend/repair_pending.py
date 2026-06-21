"""
Repair Script: Re-trigger processing pipeline for all stuck PENDING/FAILED papers.
Run from backend directory:
    .\venv\Scripts\python.exe repair_pending.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))


async def main():
    from app.db.sqlite import AsyncSessionLocal
    from app.services.paper_service import process_paper_pipeline
    from sqlalchemy import select, text
    from app.models.paper import Paper

    print("=== Repair Script: Fixing PENDING papers ===")

    # Step 1: Collect stuck paper IDs in one session, then close it
    stuck = []
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Paper.paper_id, Paper.filename, Paper.status)
            .where(Paper.status.in_(["pending", "failed"]))
        )
        rows = result.all()
        for row in rows:
            stuck.append({"paper_id": row[0], "filename": row[1], "status": row[2]})

    if not stuck:
        print("No stuck papers found! All papers are already processed.")
        return

    print(f"Found {len(stuck)} stuck paper(s). Re-processing...\n")

    # Step 2: Process each paper in its own fresh session
    success_count = 0
    fail_count = 0

    for item in stuck:
        paper_id = item["paper_id"]
        filename = item["filename"]
        print(f"[Processing] {filename} ({paper_id})")

        async with AsyncSessionLocal() as db:
            try:
                await process_paper_pipeline(db, paper_id)
                await db.commit()
                print(f"  ✅ SUCCESS → status=ready\n")
                success_count += 1
            except Exception as e:
                await db.rollback()
                print(f"  ❌ FAILED: {e}\n")
                fail_count += 1

    print(f"=== Repair Complete: {success_count} success, {fail_count} failed ===")


if __name__ == "__main__":
    asyncio.run(main())
