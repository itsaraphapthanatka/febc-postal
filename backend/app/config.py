from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database (existing MySQL febcthcom_dev24)
    DB_HOST: str = "host.docker.internal"
    DB_PORT: int = 3306
    DB_DATABASE: str = "febcthcom_dev24"
    DB_USERNAME: str = "root"
    DB_PASSWORD: str = ""

    # Auth / JWT
    JWT_SECRET: str = "dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 720
    COOKIE_NAME: str = "febc_session"
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"

    # Login throttle
    LOGIN_MAX_ATTEMPTS: int = 5
    LOGIN_DECAY_MINUTES: int = 10

    # App
    CORS_ORIGINS: str = "http://localhost:3000"
    MEDIA_DIR: str = "/app/media"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
