from __future__ import annotations

import hashlib
import re
from datetime import datetime, timezone
from urllib.parse import urlparse

from app.config.settings import settings
from app.core.errors import ProblemDetailError

# Strict canonical platform URL allowlists (prevents SSRF & arbitrary URL ingestion)
X_PROFILE_RE = re.compile(r"^https://(?:x\.com|twitter\.com)/([A-Za-z0-9_]{1,15})/?$")
X_POST_RE = re.compile(r"^https://(?:x\.com|twitter\.com)/(?:i|[A-Za-z0-9_]{1,15})/status/(\d{5,25})/?(?:\?.*)?$")

THREADS_PROFILE_RE = re.compile(r"^https://(?:www\.)?threads\.(?:net|com)/@([A-Za-z0-9_.-]{1,30})/?$")
THREADS_POST_RE = re.compile(r"^https://(?:www\.)?threads\.(?:net|com)/@([A-Za-z0-9_.-]{1,30})/post/([A-Za-z0-9_-]{5,35})/?(?:\?.*)?$")
THREADS_SHORT_POST_RE = re.compile(r"^https://(?:www\.)?threads\.(?:net|com)/t/([A-Za-z0-9_-]{5,35})/?(?:\?.*)?$")

# Automated PII redaction patterns for community report explanations
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(?<!\d)(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}(?!\d)")


def normalize_username(username: str) -> str:
    cleaned = username.strip().lstrip("@")
    if not re.match(r"^[A-Za-z0-9_.-]{1,64}$", cleaned):
        raise ProblemDetailError(
            status_code=400,
            code="INVALID_ACCOUNT_IDENTIFIER",
            title="Invalid Account Identifier",
            detail="Account handle contains unsupported characters.",
        )
    return cleaned.lower()


def canonicalize_x_account_url(url: str) -> tuple[str, str]:
    parsed = urlparse(url.strip())
    if parsed.scheme != "https" or parsed.netloc.lower() not in {"x.com", "twitter.com", "www.x.com", "www.twitter.com"}:
        raise ProblemDetailError(
            status_code=422,
            code="INVALID_ACCOUNT_IDENTIFIER",
            title="Invalid Account URL",
            detail="Account URL must be a canonical https://x.com/<handle> profile URL.",
        )
    normalized_url = f"https://x.com{parsed.path.rstrip('/')}"
    match = X_PROFILE_RE.match(normalized_url)
    if not match:
        raise ProblemDetailError(
            status_code=422,
            code="INVALID_ACCOUNT_IDENTIFIER",
            title="Invalid Account URL",
            detail="Account URL must point directly to a valid X user profile.",
        )
    handle = match.group(1)
    return handle, f"https://x.com/{handle}"


def canonicalize_x_evidence_url(url: str) -> tuple[str, str]:
    raw = url.strip()
    parsed = urlparse(raw)
    if parsed.scheme != "https" or parsed.netloc.lower() not in {"x.com", "twitter.com", "www.x.com", "www.twitter.com"}:
        raise ProblemDetailError(
            status_code=422,
            code="INVALID_EVIDENCE_URL",
            title="Invalid Evidence URL",
            detail="Evidence URLs must match the canonical public https://x.com/<handle>/status/<id> format.",
        )
    canonical_check = f"https://x.com{parsed.path}"
    match = X_POST_RE.match(canonical_check)
    if not match:
        raise ProblemDetailError(
            status_code=422,
            code="INVALID_EVIDENCE_URL",
            title="Invalid Evidence URL",
            detail="Evidence URL must reference a specific public X post or reply status ID.",
        )
    post_id = match.group(1)
    return post_id, f"https://x.com/i/status/{post_id}"


def canonicalize_threads_account_url(url: str) -> tuple[str, str]:
    parsed = urlparse(url.strip())
    netloc = parsed.netloc.lower()
    if parsed.scheme != "https" or netloc not in {"threads.net", "www.threads.net", "threads.com", "www.threads.com"}:
        raise ProblemDetailError(
            status_code=422,
            code="INVALID_ACCOUNT_IDENTIFIER",
            title="Invalid Account URL",
            detail="Account URL must be a canonical https://threads.net/@<handle> profile URL.",
        )
    normalized_url = f"https://threads.net{parsed.path.rstrip('/')}"
    match = THREADS_PROFILE_RE.match(normalized_url)
    if not match:
        raise ProblemDetailError(
            status_code=422,
            code="INVALID_ACCOUNT_IDENTIFIER",
            title="Invalid Account URL",
            detail="Account URL must point directly to a valid Threads profile (e.g. https://threads.net/@username).",
        )
    handle = match.group(1)
    return handle, f"https://threads.net/@{handle}"


def canonicalize_threads_evidence_url(url: str) -> tuple[str, str]:
    raw = url.strip()
    parsed = urlparse(raw)
    netloc = parsed.netloc.lower()
    if parsed.scheme != "https" or netloc not in {"threads.net", "www.threads.net", "threads.com", "www.threads.com"}:
        raise ProblemDetailError(
            status_code=422,
            code="INVALID_EVIDENCE_URL",
            title="Invalid Evidence URL",
            detail="Evidence URLs must match canonical public Threads post URLs (e.g. https://threads.net/@user/post/<id>).",
        )
    canonical_check = f"https://threads.net{parsed.path}"
    post_match = THREADS_POST_RE.match(canonical_check)
    if post_match:
        post_id = post_match.group(2)
        user_handle = post_match.group(1)
        return post_id, f"https://threads.net/@{user_handle}/post/{post_id}"
    short_match = THREADS_SHORT_POST_RE.match(canonical_check)
    if short_match:
        post_id = short_match.group(1)
        return post_id, f"https://threads.net/t/{post_id}"
    raise ProblemDetailError(
        status_code=422,
        code="INVALID_EVIDENCE_URL",
        title="Invalid Evidence URL",
        detail="Evidence URL must reference a specific public Threads post or reply ID.",
    )


def canonicalize_account_url(platform: str, url: str) -> tuple[str, str]:
    p = platform.strip().lower()
    if p in {"x", "twitter"}:
        return canonicalize_x_account_url(url)
    if p == "threads":
        return canonicalize_threads_account_url(url)
    raise ProblemDetailError(
        status_code=400,
        code="UNSUPPORTED_PLATFORM",
        title="Unsupported Platform",
        detail=f"Canonical URL validation for platform '{platform}' is not yet implemented.",
    )


def canonicalize_evidence_url(platform: str, url: str) -> tuple[str, str]:
    p = platform.strip().lower()
    if p in {"x", "twitter"}:
        return canonicalize_x_evidence_url(url)
    if p == "threads":
        return canonicalize_threads_evidence_url(url)
    raise ProblemDetailError(
        status_code=400,
        code="UNSUPPORTED_PLATFORM",
        title="Unsupported Platform",
        detail=f"Evidence URL validation for platform '{platform}' is not yet implemented.",
    )


def redact_pii(text: str | None) -> str | None:
    if text is None:
        return None
    scrubbed = EMAIL_RE.sub("[REDACTED_EMAIL]", text)
    scrubbed = PHONE_RE.sub("[REDACTED_PHONE]", scrubbed)
    return scrubbed.strip()


def hash_ip_subnet(ip_address: str) -> str:
    """Rotating daily-salted /24 (IPv4) or /48 (IPv6) subnet hash for brigading checks."""
    day_salt = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    if ":" in ip_address:
        subnet = ":".join(ip_address.split(":")[:3])
    else:
        parts = ip_address.split(".")
        subnet = ".".join(parts[:3]) if len(parts) == 4 else ip_address
    payload = f"{settings.app_secret_key}:{day_salt}:{subnet}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def sha256_hex(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()
