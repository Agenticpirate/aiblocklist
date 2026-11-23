from __future__ import annotations

import math
import re
from collections import Counter
from dataclasses import dataclass
from datetime import datetime


TOKEN_RE = re.compile(r"[a-z0-9']+")
MENTION_RE = re.compile(r"@[A-Za-z0-9_]+")
URL_RE = re.compile(r"https?://\S+")


@dataclass(frozen=True)
class ReplySample:
    post_id: str
    target_author: str
    text: str  # Used transiently in-memory ONLY; never persisted to DB
    created_at: datetime
    reply_latency_sec: float | None = None
    is_mutual: bool = False
    has_followup_turn: bool = False


@dataclass(frozen=True)
class SignalResult:
    signal_code: str
    triggered: bool
    corroborative_only: bool
    metrics: dict


def _tf_vector(text: str) -> Counter[str]:
    cleaned = URL_RE.sub("", MENTION_RE.sub("", text.lower()))
    tokens = TOKEN_RE.findall(cleaned)
    return Counter(tokens)


def cosine_similarity(text_a: str, text_b: str) -> float:
    va = _tf_vector(text_a)
    vb = _tf_vector(text_b)
    if not va or not vb:
        return 0.0
    shared = set(va) & set(vb)
    dot = sum(va[k] * vb[k] for k in shared)
    norm_a = math.sqrt(sum(v * v for v in va.values()))
    norm_b = math.sqrt(sum(v * v for v in vb.values()))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return round(dot / (norm_a * norm_b), 4)


def structural_skeleton(text: str) -> str:
    """Extracts a multi-clause punctuation/slot skeleton to catch synonym-rotated reply templates."""
    cleaned = URL_RE.sub("<URL>", MENTION_RE.sub("<MENTION>", text.strip()))
    clauses = [c.strip() for c in re.split(r"[!?.]+", cleaned) if c.strip()]
    if len(clauses) < 2:
        return ""
    buckets: list[str] = []
    for c in clauses[:4]:
        word_count = len(TOKEN_RE.findall(c.lower()))
        size_bucket = "S" if word_count <= 4 else ("M" if word_count <= 12 else "L")
        has_q = "?" in cleaned
        buckets.append(f"{size_bucket}{'Q' if has_q else ''}")
    return "|".join(buckets)


def evaluate_behavioral_signals(
    samples: list[ReplySample],
    *,
    linked_accounts_in_30m: int = 1,
) -> dict:
    """
    Deterministic Policy v1.0.0 Behavioral Signal Engine (SIG-01 through SIG-05).
    NEVER evaluates writing style, grammar, English proficiency, or AI-detector scores.
    SIG-05 (timing/cadence) is strictly corroborative and can NEVER trigger escalation alone.
    """
    results: list[SignalResult] = []

    # SIG-01: Near-duplicate unsolicited replies (>=3 replies, cosine >=0.90 across >=3 unrelated authors)
    high_sim_pairs = 0
    matched_authors: set[str] = set()
    max_sim = 0.0
    for i in range(len(samples)):
        for j in range(i + 1, len(samples)):
            if samples[i].target_author == samples[j].target_author:
                continue
            sim = cosine_similarity(samples[i].text, samples[j].text)
            if sim > max_sim:
                max_sim = sim
            if sim >= 0.90:
                high_sim_pairs += 1
                matched_authors.add(samples[i].target_author)
                matched_authors.add(samples[j].target_author)
    sig01_triggered = len(matched_authors) >= 3 and high_sim_pairs >= 2
    results.append(
        SignalResult(
            signal_code="SIG-01",
            triggered=sig01_triggered,
            corroborative_only=False,
            metrics={
                "max_cosine_similarity": max_sim,
                "near_duplicate_pairs": high_sim_pairs,
                "distinct_target_authors": len(matched_authors),
                "sample_size": len(samples),
            },
        )
    )

    # SIG-02: Structural template reuse (>=5 replies sharing identical skeleton)
    skeleton_counts = Counter(structural_skeleton(s.text) for s in samples if s.text.strip())
    top_skeleton, top_count = skeleton_counts.most_common(1)[0] if skeleton_counts else ("", 0)
    sig02_triggered = top_count >= 5 and top_skeleton != ""
    results.append(
        SignalResult(
            signal_code="SIG-02",
            triggered=sig02_triggered,
            corroborative_only=False,
            metrics={
                "top_template_count": top_count,
                "top_template_skeleton": top_skeleton,
                "sample_size": len(samples),
            },
        )
    )

    # SIG-03: Extreme fan-out / zero-conversation ratio (>=20 replies, >90% non-mutual, <5% follow-up; must pair with SIG-01 or SIG-02)
    total = len(samples)
    non_mutual_ratio = sum(1 for s in samples if not s.is_mutual) / total if total else 0.0
    followup_ratio = sum(1 for s in samples if s.has_followup_turn) / total if total else 0.0
    sig03_raw = total >= 20 and non_mutual_ratio > 0.90 and followup_ratio < 0.05
    sig03_triggered = sig03_raw and (sig01_triggered or sig02_triggered)
    results.append(
        SignalResult(
            signal_code="SIG-03",
            triggered=sig03_triggered,
            corroborative_only=False,
            metrics={
                "sample_size": total,
                "non_mutual_ratio": round(non_mutual_ratio, 4),
                "followup_ratio": round(followup_ratio, 4),
                "paired_with_primary_signal": sig01_triggered or sig02_triggered,
            },
        )
    )

    # SIG-04: Coordinated campaign cluster (>=3 distinct accounts synchronized within 30m)
    sig04_triggered = linked_accounts_in_30m >= 3
    results.append(
        SignalResult(
            signal_code="SIG-04",
            triggered=sig04_triggered,
            corroborative_only=False,
            metrics={"linked_accounts_in_30m": linked_accounts_in_30m},
        )
    )

    # SIG-05: Corroborative cadence anomaly (median latency <15s across >10 authors) — NEVER sufficient alone
    latencies = sorted(s.reply_latency_sec for s in samples if s.reply_latency_sec is not None)
    median_latency = latencies[len(latencies) // 2] if latencies else None
    distinct_authors = len({s.target_author for s in samples})
    sig05_triggered = median_latency is not None and median_latency < 15.0 and distinct_authors > 10
    results.append(
        SignalResult(
            signal_code="SIG-05",
            triggered=sig05_triggered,
            corroborative_only=True,
            metrics={
                "median_reply_latency_sec": median_latency,
                "distinct_authors": distinct_authors,
                "note": "Corroborative signal only; never triggers classification alone.",
            },
        )
    )

    primary_triggered = any(r.triggered and not r.corroborative_only for r in results)
    return {
        "policy_version": "v1.0.0",
        "escalate_for_human_review": primary_triggered,
        "requires_human_approval": True,
        "signals": [
            {
                "signal_code": r.signal_code,
                "triggered": r.triggered,
                "corroborative_only": r.corroborative_only,
                "metrics": r.metrics,
            }
            for r in results
        ],
    }
