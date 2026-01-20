from typing import Optional
from datetime import timedelta
from fastapi import HTTPException, status, Response, Request
from sqlmodel import Session
from jose import JWTError, jwt

from app.repositories.user_repository import UserRepository
from app.models import User
from app.auth import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    create_refresh_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
    REFRESH_SECRET_KEY,
    ALGORITHM
)


class AuthService:
    def __init__(self, session: Session):
        self.repository = UserRepository(session)
        self.session = session

    def register_user(self, email: str, password: str, password_confirm: str) -> User:
        existing_user = self.repository.get_by_email(email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        if password != password_confirm:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )

        hashed_password = get_password_hash(password)
        new_user = User(
            email=email,
            hashed_password=hashed_password
        )
        return self.repository.create(new_user)

    def login_user(self, response: Response, username: str, password: str) -> dict:
        user = authenticate_user(self.session, username, password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(
            data={"sub": user.email}
        )

        response.set_cookie(
            key="access_token",
            value=f"Bearer {access_token}",
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
        )

        return {"message": "Login successful"}

    def refresh_token(self, response: Response, request: Request) -> dict:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

        token = request.cookies.get("refresh_token")
        if not token:
            raise credentials_exception

        try:
            payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            token_type: str = payload.get("type")
            if email is None or token_type != "refresh":
                raise credentials_exception
        except JWTError:
            raise credentials_exception

        user = self.repository.get_by_email(email)
        if user is None:
            raise credentials_exception

        new_access_token = create_access_token(data={"sub": user.email})
        new_refresh_token = create_refresh_token(data={"sub": user.email})

        response.set_cookie(
            key="access_token",
            value=f"Bearer {new_access_token}",
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
        )

        return {"message": "Token refreshed"}

    @staticmethod
    def logout_user(response: Response) -> dict:
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return {"message": "Logged out"}

