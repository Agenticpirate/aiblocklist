from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_DIR = Path(__file__).resolve().parents[4]
DEFAULT_LOCAL_DB = f"sqlite+aiosqlite:///{ROOT_DIR / 'database' / 'aiblocklist_local.db'}"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "AIBlockList API"
    app_version: str = "1.0.0"
    api_schema_version: str = "1.0"
    app_env: str = "local"
    app_secret_key: str = "local-dev-secret-change-in-production"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:3002,http://127.0.0.1:3002"

    database_url: str = DEFAULT_LOCAL_DB
    valkey_url: str = "redis://localhost:6379/0"

    # External seed path
    external_seed_path: str = str(ROOT_DIR / "database" / "seeds" / "external_blockedforaireply.json")

    # Rate limits & governance thresholds
    api_rate_limit_anonymous: int = 60
    api_rate_limit_registered: int = 600
    report_rate_limit_hourly_ip: int = 20
    brigading_burst_count: int = 5
    brigading_burst_window_minutes: int = 15
    moderation_high_impact_threshold: int = 10000
    account_review_expiry_days: int = 180
    appeal_sla_business_days: int = 7
    appeal_cooldown_days: int = 14
    external_sync_anomaly_ratio: float = 0.10
    x_api_budget_cap_usd: float = 100.0

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
