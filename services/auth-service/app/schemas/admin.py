from pydantic import BaseModel, ConfigDict, EmailStr, Field


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(
        ...,
        min_length=12,
        description="Password must be at least 12 characters long",
    )


class AdminProfileResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    totp_enabled: bool
    created_at: str

    model_config = ConfigDict(from_attributes=True)


class AdminAuthSuccessResponse(BaseModel):
    status: str = "authenticated"
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    admin: AdminProfileResponse


class AdminTotpRequiredResponse(BaseModel):
    status: str = "totp_required"
    pre_auth_token: str
    expires_in: int


class AdminTotpEnrollmentRequiredResponse(BaseModel):
    status: str = "totp_enrollment_required"
    pre_auth_token: str
    qr_code_svg: str
    secret: str
    recovery_codes: list[str]
    expires_in: int


class AdminTotpVerifyRequest(BaseModel):
    pre_auth_token: str
    code: str = Field(
        ..., min_length=6, description="6-digit TOTP or backup recovery code"
    )


class AdminTotpConfirmEnrollmentRequest(BaseModel):
    pre_auth_token: str
    code: str = Field(..., min_length=6, max_length=8)


class AdminInviteRequest(BaseModel):
    email: EmailStr
    name: str
    role: str = Field(default="admin", pattern="^(admin|super_admin)$")


class AdminInviteResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    message: str
