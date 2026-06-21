from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.models.paper import Paper
from app.models.citation import Citation
from app.models.user import User
from app.utils.dependencies import get_current_user, get_db

router = APIRouter(prefix="/api/graph", tags=["Knowledge Graph"])

@router.get("", summary="Get Knowledge Graph Data")
async def get_knowledge_graph(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Returns nodes and edges representing the connections between papers and citations
    for the interactive knowledge graph.
    """
    # Fetch all papers for this user
    result = await db.execute(
        select(Paper.paper_id, Paper.title, Paper.authors)
        .where(Paper.user_id == current_user.id)
    )
    papers = result.fetchall()
    
    nodes = []
    edges = []
    
    # Track nodes we've added to avoid duplicates
    node_ids = set()
    
    for p in papers:
        pid = p.paper_id
        nodes.append({
            "id": pid,
            "name": p.title or "Untitled",
            "group": 1, # Group 1 = Uploaded Papers
            "val": 20   # Size
        })
        node_ids.add(pid)
        
    # Fetch all citations for these papers to build edges
    if papers:
        paper_ids = [p.paper_id for p in papers]
        result = await db.execute(
            select(Citation.paper_id, Citation.title, Citation.author)
            .where(Citation.paper_id.in_(paper_ids))
        )
        citations = result.fetchall()
        
        for c in citations:
            if not c.title:
                continue
                
            # Create a unique ID for the cited work
            cited_id = f"cite_{hash(c.title)}"
            
            if cited_id not in node_ids:
                nodes.append({
                    "id": cited_id,
                    "name": c.title,
                    "group": 2, # Group 2 = Cited Works
                    "val": 10   # Smaller size
                })
                node_ids.add(cited_id)
                
            # Create an edge from the uploaded paper to the cited work
            edges.append({
                "source": c.paper_id,
                "target": cited_id
            })

    return {"nodes": nodes, "links": edges}
