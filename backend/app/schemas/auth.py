from pydantic import BaseModel, ConfigDict


class LoginRequest(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str | None = None
    name: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    role: str | None = None
    is_admin: bool | None = None
    avatar: str | None = None
