from app.core.errors import ProblemDetailError

# Exact 7-state classification taxonomy required by Section 5.1
VALID_CLASSIFICATIONS = frozenset(
    {
        "confirmed_automated_spam",
        "repetitive_engagement_farming",
        "coordinated_manipulation",
        "suspicious_automation",
        "under_review",
        "cleared",
        "delisted",
    }
)

PUBLIC_LISTED_CLASSIFICATIONS = frozenset(
    {
        "confirmed_automated_spam",
        "repetitive_engagement_farming",
        "coordinated_manipulation",
    }
)

SUPPORTED_PLATFORMS = frozenset(
    {
        "x",
        "bluesky",
        "mastodon",
        "reddit",
        "threads",
        "telegram",
        "discord",
        "linkedin",
        "instagram",
        "facebook",
    }
)

# Active MVP platforms (LinkedIn/Facebook/Instagram excluded from global scraping)
ACTIVE_PLATFORMS = frozenset({"x"})

ALLOWED_CLASSIFICATION_TRANSITIONS: dict[str, set[str]] = {
    "under_review": {
        "under_review",
        "cleared",
        "suspicious_automation",
        "confirmed_automated_spam",
        "repetitive_engagement_farming",
        "coordinated_manipulation",
        "delisted",
    },
    "suspicious_automation": {
        "under_review",
        "cleared",
        "confirmed_automated_spam",
        "repetitive_engagement_farming",
        "coordinated_manipulation",
        "delisted",
    },
    "confirmed_automated_spam": {"under_review", "cleared", "delisted"},
    "repetitive_engagement_farming": {"under_review", "cleared", "delisted"},
    "coordinated_manipulation": {"under_review", "cleared", "delisted"},
    "cleared": {"under_review"},
    "delisted": {"under_review"},
}


def validate_classification_transition(current: str, target: str) -> None:
    if target not in VALID_CLASSIFICATIONS:
        raise ProblemDetailError(
            status_code=400,
            code="INVALID_CLASSIFICATION",
            title="Invalid Classification",
            detail=f"Classification '{target}' is not part of the approved 7-state taxonomy.",
        )
    allowed = ALLOWED_CLASSIFICATION_TRANSITIONS.get(current, set())
    if target not in allowed:
        raise ProblemDetailError(
            status_code=409,
            code="ILLEGAL_STATE_TRANSITION",
            title="Illegal State Transition",
            detail=f"Transition from '{current}' to '{target}' is prohibited by the domain state machine.",
        )
