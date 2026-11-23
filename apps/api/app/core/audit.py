from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import AuditLog

GENESIS_HASH = "0" * 64


def compute_record_hash(
    prev_hash: str,
    entity_type: str,
    entity_id: str,
    action: str,
    actor_role: str,
    payload_diff: dict,
    created_at: datetime,
) -> str:
    canonical_payload = json.dumps(payload_diff, sort_keys=True, separators=(",", ":"), default=str)
    ts = created_at.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    raw = f"{prev_hash}|{entity_type}|{entity_id}|{action}|{actor_role}|{canonical_payload}|{ts}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


async def append_audit_log(
    db: AsyncSession,
    *,
    entity_type: str,
    entity_id: str,
    action: str,
    actor_role: str,
    payload_diff: dict,
    actor_pseudonym: str = "system",
) -> AuditLog:
    last_row = (await db.execute(select(AuditLog).order_by(desc(AuditLog.id)).limit(1))).scalar_one_or_none()
    prev_hash = last_row.record_hash if last_row else GENESIS_HASH
    now = datetime.now(timezone.utc)
    record_hash = compute_record_hash(
        prev_hash=prev_hash,
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        actor_role=actor_role,
        payload_diff=payload_diff,
        created_at=now,
    )
    entry = AuditLog(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        actor_role=actor_role,
        actor_pseudonym=actor_pseudonym,
        payload_diff=payload_diff,
        prev_hash=prev_hash,
        record_hash=record_hash,
        created_at=now,
    )
    db.add(entry)
    await db.flush()
    return entry


async def verify_audit_chain(db: AsyncSession) -> tuple[bool, int, str]:
    """Walks the append-only audit log and returns (is_valid, count, merkle_root_sha256)."""
    rows = (await db.execute(select(AuditLog).order_by(AuditLog.id.asc()))).scalars().all()
    if not rows:
        return True, 0, GENESIS_HASH

    expected_prev = GENESIS_HASH
    hashes: list[str] = []
    for row in rows:
        created = row.created_at
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        recomputed = compute_record_hash(
            prev_hash=row.prev_hash,
            entity_type=row.entity_type,
            entity_id=row.entity_id,
            action=row.action,
            actor_role=row.actor_role,
            payload_diff=row.payload_diff,
            created_at=created,
        )
        if row.prev_hash != expected_prev or row.record_hash != recomputed:
            return False, len(rows), ""
        expected_prev = row.record_hash
        hashes.append(row.record_hash)

    # Compute Merkle root
    layer = hashes[:]
    while len(layer) > 1:
        next_layer: list[str] = []
        for i in range(0, len(layer), 2):
            left = layer[i]
            right = layer[i + 1] if i + 1 < len(layer) else left
            next_layer.append(hashlib.sha256(f"{left}{right}".encode("utf-8")).hexdigest())
        layer = next_layer

    return True, len(rows), layer[0]
