from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.core.database import AsyncSessionLocal, Base, engine
from app.core.errors import register_exception_handlers
from app.modules.accounts.router import router as accounts_router
from app.modules.appeals.router import router as appeals_router
from app.modules.federation.ingest_external import ingest_blockedforaireply_seed
from app.modules.reports.router import router as reports_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as db:
        await ingest_blockedforaireply_seed(db)
    yield


app = FastAPI(
    title="AIBlockList.com Public Intelligence & Governance API",
    version=settings.app_version,
    description=(
        "Independent, open source trust and safety infrastructure for identifying, "
        "verifying, aggregating, and filtering abusive automated social media behavior."
    ),
    lifespan=lifespan,
)
app.openapi_version = "3.1.0"

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(accounts_router)
app.include_router(reports_router)
app.include_router(appeals_router)


@app.get("/api/v1/health", tags=["System"])
async def health_check() -> dict:
    return {"status": "ok", "environment": settings.app_env}


@app.get("/api/v1/version", tags=["System"])
async def version_info() -> dict:
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "schema_version": settings.api_schema_version,
        "active_policy_version": "v1.0.0",
        "code_license": "Apache-2.0",
        "data_license": "ODC-By-1.0",
    }
