from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.models import ExternalSource, SourceSyncRun
from app.modules.federation.sync_service import sync_blockedforaireply

router = APIRouter(prefix="/api/v1/sources", tags=["External Federation Sources"])


@router.get("", summary="List federated intelligence sources")
async def list_sources(db: AsyncSession = Depends(get_db)):
    """Returns all external blocklists and intelligence sources registered in AIBlockList."""
    query = await db.execute(select(ExternalSource).order_by(ExternalSource.display_name))
    sources = query.scalars().all()
    return {
        "sources": [
            {
                "id": s.id,
                "slug": s.slug,
                "display_name": s.display_name,
                "maintainer_handle": s.maintainer_handle,
                "source_url": s.source_url,
                "license_spdx": s.license_spdx,
                "sync_enabled": s.sync_enabled,
                "reliability_score": s.reliability_score,
                "last_synced_at": s.last_synced_at.isoformat() if s.last_synced_at else None,
            }
            for s in sources
        ]
    }


@router.get("/runs", summary="List source synchronization run history")
async def list_sync_runs(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Returns historical synchronization audit records across all federated sources."""
    query = await db.execute(
        select(SourceSyncRun, ExternalSource)
        .join(ExternalSource, SourceSyncRun.source_id == ExternalSource.id)
        .order_by(desc(SourceSyncRun.started_at))
        .limit(limit)
    )
    results = query.all()
    return {
        "runs": [
            {
                "id": run.id,
                "source_slug": src.slug,
                "source_name": src.display_name,
                "source_version": run.source_version,
                "records_total": run.records_total,
                "records_added": run.records_added,
                "records_removed": run.records_removed,
                "change_ratio": run.change_ratio,
                "status": run.status,
                "started_at": run.started_at.isoformat(),
                "completed_at": run.completed_at.isoformat() if run.completed_at else None,
            }
            for run, src in results
        ]
    }


@router.post("/sync", summary="Trigger immediate federated source synchronization")
async def trigger_source_sync(
    source_slug: str = Query("blockedforaireply", description="Source slug to sync"),
    db: AsyncSession = Depends(get_db),
):
    """
    Triggers an immediate incremental synchronization from the specified external source.
    Pulls live data, isolates unverified accounts, hashes evidence text, and logs immutable audit trails.
    """
    if source_slug == "blockedforaireply":
        result = await sync_blockedforaireply(db, force=True)
        return {"status": "ok", "result": result}
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported source slug: '{source_slug}'. Supported sources: ['blockedforaireply']",
        )
