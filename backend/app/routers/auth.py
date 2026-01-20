from fastapi import APIRouter, Depends, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session as SQLSession

from app.auth import get_current_active_user
from app.database import get_session
from app.models import UserCreate, UserPublic, User
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, session: SQLSession = Depends(get_session)):
    auth_service = AuthService(session)
    new_user = auth_service.register_user(user_data.email, user_data.password, user_data.password_confirm)
    return new_user


@router.post("/login")
async def login(
        response: Response,
        form_data: OAuth2PasswordRequestForm = Depends(),
        session: SQLSession = Depends(get_session)
):
    auth_service = AuthService(session)
    return auth_service.login_user(response, form_data.username, form_data.password)


@router.post("/refresh")
def refresh_token(response: Response, request: Request, session: SQLSession = Depends(get_session)):
    auth_service = AuthService(session)
    return auth_service.refresh_token(response, request)


@router.post("/logout")
async def logout(response: Response):
    return AuthService.logout_user(response)


@router.get("/me", response_model=UserPublic)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user