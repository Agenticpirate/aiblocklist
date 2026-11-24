"""
AIBlockList Federation Synchronization CLI Tool.
Usage:
  cd apps/api && uv run python -m app.modules.federation.sync_cli [--force]
"""

from __future__ import annotations

import argparse
import asyncio
import sys

from app.core.database import AsyncSessionLocal
from app.modules.federation.sync_service import sync_blockedforaireply


async def main_async(force: bool = False) -> int:
    print("=" * 70)
    print("  AIBlockList.com — External Blocklist Federation Sync Engine")
    print("=" * 70)
    print(f"[*] Connecting to database and initiating sync (force={force})...")

    async with AsyncSessionLocal() as db:
        res = await sync_blockedforaireply(db, force=force)

    print("\n[+] Synchronization Completed Successfully:")
    for k, v in res.items():
        print(f"    - {k}: {v}")
    print("=" * 70)
    return 0


def main():
    parser = argparse.ArgumentParser(description="Synchronize external blocklists into AIBlockList")
    parser.add_argument("--force", action="store_true", help="Force sync even if sync_enabled is false")
    args = parser.parse_args()

    exit_code = asyncio.run(main_async(force=args.force))
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
