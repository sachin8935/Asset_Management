from flask import Blueprint, g, jsonify, request
from werkzeug.security import generate_password_hash

from ..api_utils import pagination_response, parse_pagination_params
from ..auth.constants import ROLES
from ..auth.middleware import jwt_required, roles_required
from ..extensions import db
from ..models import ActivityLog, User

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.get("/users")
@jwt_required
@roles_required("Admin")
def get_all_users():
    params = parse_pagination_params()
    result = User.query.order_by(User.id.asc()).paginate(
        page=params.page,
        per_page=params.per_page,
        error_out=False,
    )
    return jsonify(
        pagination_response("users", [user.to_dict() for user in result.items], result)
    )


@admin_bp.post("/users")
@jwt_required
@roles_required("Admin")
def create_user_by_admin():
    payload = request.get_json(silent=True) or {}

    required_fields = ["name", "email", "password", "role"]
    missing = [field for field in required_fields if not payload.get(field)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    role = (payload.get("role") or "").strip()
    if role not in {"IT Manager", "Employee"}:
        return jsonify({"error": "Admin can create only IT Manager or Employee accounts"}), 400

    email = (payload.get("email") or "").strip().lower()
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Email already registered"}), 409

    user = User(
        name=(payload.get("name") or "").strip(),
        email=email,
        password=generate_password_hash(payload["password"]),
        role=role,
        department=(payload.get("department") or "").strip() or None,
    )
    db.session.add(user)
    db.session.flush()

    db.session.add(
        ActivityLog(
            user_id=g.current_user_id,
            action=(
                f"Created user: user_id={user.id}, role={user.role}, "
                f"email={user.email}"
            ),
        )
    )
    db.session.commit()

    return jsonify({"message": "User created successfully", "user": user.to_dict()}), 201


@admin_bp.patch("/users/<int:user_id>/role")
@jwt_required
@roles_required("Admin")
def update_user_role(user_id: int):
    payload = request.get_json(silent=True) or {}
    new_role = (payload.get("role") or "").strip()

    if not new_role:
        return jsonify({"error": "Role is required"}), 400

    if new_role not in ROLES:
        return jsonify({"error": f"Invalid role. Allowed roles: {', '.join(sorted(ROLES))}"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.id == g.current_user_id:
        return jsonify({"error": "Admin cannot change own role"}), 400

    previous_role = user.role
    user.role = new_role

    db.session.add(
        ActivityLog(
            user_id=g.current_user_id,
            action=(
                f"Updated user role: user_id={user.id}, "
                f"from={previous_role}, to={new_role}"
            ),
        )
    )
    db.session.commit()

    return jsonify(
        {
            "message": "User role updated successfully",
            "user": user.to_dict(),
        }
    )