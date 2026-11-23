from __future__ import annotations

import time
from collections import defaultdict, deque

from app.core.errors import ProblemDetailError


class SlidingWindowRateLimiter:
    """In-memory sliding window limiter for local/test; mirrors Valkey window semantics."""

    def __init__(self) -> None:
        self._buckets: dict[str, deque[float]] = defaultdict(deque)

    def check(self, bucket_key: str, limit: int, window_seconds: int) -> tuple[int, int]:
        now = time.time()
        cutoff = now - window_seconds
        q = self._buckets[bucket_key]
        while q and q[0] <= cutoff:
            q.popleft()
        if len(q) >= limit:
            raise ProblemDetailError(
                status_code=429,
                code="RATE_LIMITED",
                title="Rate Limit Exceeded",
                detail=f"Exceeded {limit} requests per {window_seconds} seconds. Retry later.",
            )
        q.append(now)
        remaining = max(0, limit - len(q))
        reset_at = int(now + window_seconds)
        return remaining, reset_at

    def reset(self) -> None:
        self._buckets.clear()


rate_limiter = SlidingWindowRateLimiter()
