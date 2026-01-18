from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError,jwt
from sqlmodel import Session as SQLSession, select

from app.auth import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_refresh_token,
    REFRESH_SECRET_KEY,
    ALGORITHM,
    REFRESH_TOKEN_EXPIRE_DAYS
)
from app.database import get_session
from app.models import User, UserCreate, UserPublic

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, session: SQLSession = Depends(get_session)):
    existing_user = session.exec(select(User).where(User.email == user_data.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    if user_data.password != user_data.password_confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user


@router.post("/login")
async def login(
        response: Response,
        form_data: OAuth2PasswordRequestForm = Depends(),
        session: SQLSession = Depends(get_session)
):
    user = authenticate_user(session, form_data.username, form_data.password)
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


@router.post("/refresh")
def refresh_token(response: Response, request: Request, session: SQLSession = Depends(get_session)):
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

    user = session.exec(select(User).where(User.email == email)).first()
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


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}


@router.get("/me", response_model=UserPublic)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user