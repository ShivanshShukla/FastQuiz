import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserIdentityResponse(BaseModel):
    provider: str
    provider_user_id: str
    email_at_link: str | None = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class UserResponse(BaseModel):
    id: str
    name: str
    email: str | None = None
    email_verified: bool
    avatar_url: str | None = None
    status: str  # "pending_consent" | "active" | "suspended" | "deleted"
    source: str
    created_at: datetime.datetime
    identities: list[UserIdentityResponse] = Field(default_factory=list)
    has_password: bool = False

    model_config = ConfigDict(from_attributes=True)


class ConsentRequest(BaseModel):
    policy_version: str = "2026.1"
    accepted: bool


class ConsentResponse(BaseModel):
    status: str
    policy_version: str
    user_status: str
    message: str


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(
        ..., min_length=8, description="Password must be at least 8 characters"
    )
    name: str = Field(..., min_length=1, max_length=255)


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class MobileOAuthExchangeRequest(BaseModel):
    code: str
    code_verifier: str
    redirect_uri: str | None = None


class MessageResponse(BaseModel):
    message: str
    success: bool = True
