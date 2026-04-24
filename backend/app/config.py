from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "CLINIX"
    environment: str = "dev"
    llm_provider: str = "mock"  # mock | openai
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    cors_origins: str = ""

    # Security Configuration
    jwt_secret_key: str = "change-me-in-production-please-32-chars-exact"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    rate_limit_requests_per_minute: int = 60
    rate_limit_analyze_per_minute: int = 10
    login_attempt_limit: int = 5
    login_lockout_minutes: int = 15

    enable_dev_login: bool = environment == "dev"

    class Config:
        env_file = ".env"


settings = Settings()
