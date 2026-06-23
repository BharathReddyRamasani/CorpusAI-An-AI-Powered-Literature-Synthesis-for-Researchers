"""
API — Authentication Routes
POST /api/auth/register
POST /api/auth/login
GET  /api/profile
PUT  /api/profile
PUT  /api/change-password
"""

from datetime import datetime, timedelta, timezone
import random
import string
import logging

from fastapi import APIRouter, Depends, status, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UpdateProfileRequest,
    UserResponse,
    VerifyOTPRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.services.auth_service import (
    create_access_token,
    get_token_expiry_seconds,
    hash_password,
    verify_password,
)
from app.services.email_service import send_otp_email
from app.utils.dependencies import get_current_user, get_db
from app.utils.exceptions import BadRequestException, ConflictException, UnauthorizedException, NotFoundException

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
logger = logging.getLogger("app")


# ── POST /api/auth/register ───────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=LoginResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user and send OTP (or auto-verify in dev mode)",
)
async def register(
    payload: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user account and trigger OTP email (or auto-verify if no SMTP configured)."""
    # Check if email already exists
    existing = await db.execute(select(User).where(User.email == payload.email))
    existing_user = existing.scalar_one_or_none()
    
    if existing_user:
        if existing_user.is_verified:
            raise ConflictException(f"An account with email '{payload.email}' already exists.")
        else:
            # If not verified, we can just update the OTP and resend
            user = existing_user
            user.password_hash = hash_password(payload.password)
            user.name = payload.name
    else:
        hashed = hash_password(payload.password)
        user = User(name=payload.name, email=payload.email, password_hash=hashed, is_verified=False)
        db.add(user)

    # Auto-verify if SMTP is not configured (Development Mode)
    from app.config import settings
    if not settings.smtp_email:
        user.is_verified = True
        user.otp = None
        user.otp_expires_at = None
        await db.flush()
        await db.refresh(user)
        
        token = create_access_token(subject=user.id, role=user.role)
        logger.info(f"Auto-verified new user (Dev Mode): {user.email}")
        
        return LoginResponse(
            message="Auto-verified in dev mode.",
            token=TokenResponse(
                access_token=token,
                expires_in=get_token_expiry_seconds(),
            ),
            user=UserResponse.model_validate(user),
        )

    # Generate 6 digit OTP for production
    otp = "".join(random.choices(string.digits, k=6))
    user.otp = otp
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    await db.flush()
    await db.refresh(user)

    # Send email in background
    background_tasks.add_task(send_otp_email, user.email, otp)

    logger.info(f"New user registered: {user.email} (id={user.id})")
    
    return {
        "message": "Registration successful. Please check your email for the OTP.",
        "user": UserResponse.model_validate(user),
        "token": None
    }


# ── POST /api/auth/verify-otp ─────────────────────────────────────────────────

@router.post(
    "/verify-otp",
    response_model=LoginResponse,
    summary="Verify OTP and login",
)
async def verify_otp(
    payload: VerifyOTPRequest,
    db: AsyncSession = Depends(get_db),
) -> LoginResponse:
    """Verify the 6-digit OTP and return a JWT access token."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user:
        raise UnauthorizedException("Invalid email.")

    if user.is_verified:
        raise BadRequestException("User is already verified.")

    if user.otp != payload.otp:
        raise UnauthorizedException("Invalid OTP.")

    # Check expiration
    # Use timezone-aware comparison if user.otp_expires_at is timezone-aware.
    # SQLite datetime is naive by default, so we compare naively if necessary, but we saved it as UTC.
    expires_at = user.otp_expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
        
    if datetime.now(timezone.utc) > expires_at:
        raise UnauthorizedException("OTP has expired. Please register again to receive a new one.")

    # Verify success
    user.is_verified = True
    user.otp = None
    user.otp_expires_at = None
    await db.flush()

    token = create_access_token(subject=user.id, role=user.role)
    logger.info(f"User verified and logged in: {user.email}")

    return LoginResponse(
        message="Email verified successfully.",
        token=TokenResponse(
            access_token=token,
            expires_in=get_token_expiry_seconds(),
        ),
        user=UserResponse.model_validate(user),
    )


# ── POST /api/auth/login ──────────────────────────────────────────────────────

@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Login and receive JWT token",
)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> LoginResponse:
    """Authenticate user and return a JWT access token."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise UnauthorizedException("Invalid email or password.")

    if not user.is_verified:
        raise UnauthorizedException("Please verify your email using the OTP sent during registration.")

    token = create_access_token(subject=user.id, role=user.role)
    logger.info(f"User logged in: {user.email}")

    return LoginResponse(
        token=TokenResponse(
            access_token=token,
            expires_in=get_token_expiry_seconds(),
        ),
        user=UserResponse.model_validate(user),
    )


# ── GET /api/profile ──────────────────────────────────────────────────────────

@router.get(
    "/profile",
    response_model=UserResponse,
    summary="Get current user profile",
)
async def get_profile(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Return the authenticated user's profile."""
    return UserResponse.model_validate(current_user)


# ── PUT /api/profile ──────────────────────────────────────────────────────────

@router.put(
    "/profile",
    response_model=UserResponse,
    summary="Update user profile",
)
async def update_profile(
    payload: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Update the authenticated user's display name."""
    if payload.name:
        current_user.name = payload.name.strip()
        await db.flush()
        await db.refresh(current_user)
        logger.info(f"Profile updated for user id={current_user.id}")
    return UserResponse.model_validate(current_user)


# ── PUT /api/change-password ──────────────────────────────────────────────────

@router.put(
    "/change-password",
    summary="Change user password",
)
async def change_password(
    payload: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Change the authenticated user's password."""
    if not verify_password(payload.current_password, current_user.password_hash):
        raise BadRequestException("Current password is incorrect.")

    current_user.password_hash = hash_password(payload.new_password)
    await db.flush()
    logger.info(f"Password changed for user id={current_user.id}")
    return {"success": True, "message": "Password changed successfully."}


# ── POST /api/auth/forgot-password ────────────────────────────────────────────

@router.post(
    "/forgot-password",
    summary="Request a password reset OTP",
)
async def forgot_password(
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Generate a 6-digit OTP and send it via email for password reset."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user:
        logger.info(f"Forgot password requested for non-existent email: {payload.email}")
        raise NotFoundException("User does not exist with this email.")

    # Generate 6 digit OTP
    otp = "".join(random.choices(string.digits, k=6))
    user.otp = otp
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    await db.flush()
    await db.refresh(user)

    # Send email in background
    background_tasks.add_task(send_otp_email, user.email, otp)
    logger.info(f"Password reset OTP requested for user: {user.email}")
    logger.info(f"HUGGING FACE DEMO MODE - YOUR OTP IS: {otp}")

    return {"success": True, "message": "If an account with that email exists, an OTP has been sent."}


# ── POST /api/auth/reset-password ─────────────────────────────────────────────

@router.post(
    "/reset-password",
    summary="Reset password using OTP",
)
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Verify OTP and set a new password."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user:
        raise UnauthorizedException("Invalid email or OTP.")

    if user.otp != payload.otp:
        raise UnauthorizedException("Invalid OTP.")

    # Check expiration
    expires_at = user.otp_expires_at
    if not expires_at:
        raise UnauthorizedException("No OTP request found.")
        
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
        
    if datetime.now(timezone.utc) > expires_at:
        raise UnauthorizedException("OTP has expired. Please request a new one.")

    # Verify success: update password and clear OTP
    user.password_hash = hash_password(payload.new_password)
    user.otp = None
    user.otp_expires_at = None
    await db.flush()

    logger.info(f"Password successfully reset for user: {user.email}")

    return {"success": True, "message": "Password has been successfully reset. You can now log in."}
