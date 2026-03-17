from functools import wraps

import jwt
from flask import g, jsonify, request

from ..models import User
from .constants import role_has_feature
from .jwt_utils import decode_access_token


def _extract_bearer_token() -> str | None:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    return auth_header.split(" ", 1)[1].strip()


def jwt_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = _extract_bearer_token()
        if not token:
            return jsonify({"error": "Authorization token missing"}), 401

        try:
            payload = decode_access_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        if payload.get("type") != "access":
            return jsonify({"error": "Invalid token type"}), 401

        user = User.query.get(int(payload["sub"]))
        if not user:
            return jsonify({"error": "User not found"}), 401

        g.current_user = user
        g.current_user_id = user.id
        g.current_role = user.role

        return fn(*args, **kwargs)

    return wrapper


def roles_required(*allowed_roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            current_role = getattr(g, "current_role", None)
            if current_role not in allowed_roles:
                return jsonify({"error": "Forbidden"}), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def permission_required(feature: str):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            current_role = getattr(g, "current_role", None)
            if not current_role or not role_has_feature(current_role, feature):
                return jsonify({"error": "Forbidden"}), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator