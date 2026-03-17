from flask import Blueprint, g, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from ..auth.constants import FEATURE_ACCESS, ROLES, role_has_feature
from ..auth.jwt_utils import create_access_token
from ..auth.middleware import jwt_required, permission_required
from ..extensions import db
from ..models import ActivityLog, User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
def register_user():
    payload = request.get_json(silent=True) or {}

    required_fields = ["name", "email", "password"]
    missing = [field for field in required_fields if not payload.get(field)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    role = (payload.get("role") or "Employee").strip() or "Employee"
    if role != "Employee":
        return jsonify({"error": "Public signup is only available for Employee accounts"}), 403

    email = payload["email"].strip().lower()
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Email already registered"}), 409

    user = User(
        name=payload["name"].strip(),
        email=email,
        password=generate_password_hash(payload["password"]),
        role="Employee",
        department=(payload.get("department") or "").strip() or None,
    )
    db.session.add(user)
    db.session.flush()

    db.session.add(
        ActivityLog(
            user_id=user.id,
            action="User registered",
        )
    )
    db.session.commit()

    return jsonify({"message": "User registered successfully", "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login_user():
    payload = request.get_json(silent=True) or {}

    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(user.id, user.role)

    db.session.add(
        ActivityLog(
            user_id=user.id,
            action="User logged in",
        )
    )
    db.session.commit()

    return jsonify(
        {
            "access_token": token,
            "token_type": "Bearer",
            "user": user.to_dict(),
        }
    )


@auth_bp.get("/me")
@jwt_required
def current_user_profile():
    user = g.current_user
    role_features = {
        feature: role_has_feature(user.role, feature)
        for feature in FEATURE_ACCESS
    }
    return jsonify({"user": user.to_dict(), "permissions": role_features})


@auth_bp.get("/can/<feature>")
@jwt_required
def can_access(feature: str):
    allowed = role_has_feature(g.current_role, feature)
    return jsonify({"feature": feature, "allowed": allowed})


@auth_bp.get("/rbac-check/add-asset")
@jwt_required
@permission_required("add_asset")
def rbac_add_asset_check():
    return jsonify({"message": "Access granted for add_asset"})