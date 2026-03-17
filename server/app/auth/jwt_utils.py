from datetime import datetime, timedelta, timezone

import jwt
from flask import current_app


def create_access_token(user_id: int, role: str) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(hours=current_app.config["JWT_EXP_HOURS"])

    payload = {
        "sub": str(user_id),
        "role": role,
        "iat": now,
        "exp": exp,
        "type": "access",
    }

    return jwt.encode(
        payload,
        current_app.config["SECRET_KEY"],
        algorithm=current_app.config["JWT_ALGORITHM"],
    )


def decode_access_token(token: str) -> dict:
    return jwt.decode(
        token,
        current_app.config["SECRET_KEY"],
        algorithms=[current_app.config["JWT_ALGORITHM"]],
    )