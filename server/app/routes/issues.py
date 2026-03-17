from flask import Blueprint, g, jsonify, request

from ..api_utils import (
    APIError,
    pagination_response,
    parse_pagination_params,
    require_non_empty_string,
)
from ..auth.middleware import jwt_required, roles_required
from ..extensions import db
from ..models import ActivityLog, Asset, Issue, User
from ..models.issue import ALLOWED_ISSUE_STATUSES

issues_bp = Blueprint("issues", __name__, url_prefix="/api/issues")


# ---------------------------------------------------------------------------
# POST /api/issues  — any authenticated user reports an issue
# ---------------------------------------------------------------------------
@issues_bp.post("")
@jwt_required
def create_issue():
    payload = request.get_json(silent=True) or {}
    asset_id = payload.get("asset_id")
    description = require_non_empty_string(payload, "issue_description", max_length=2000)

    if not asset_id:
        raise APIError("asset_id is required", 400)

    asset = Asset.query.get(asset_id)
    if not asset:
        return jsonify({"error": "Asset not found"}), 404

    issue = Issue(
        asset_id=asset.id,
        employee_id=g.current_user_id,
        issue_description=description,
        status="Open",
    )
    db.session.add(issue)

    log = ActivityLog(
        user_id=g.current_user_id,
        action=(
            f"Issue reported: issue_id={issue.id}, asset_id={asset.id}, "
            f"asset_name='{asset.asset_name}'"
        ),
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Issue reported", "issue": issue.to_dict()}), 201


# ---------------------------------------------------------------------------
# GET /api/issues  — Admin / IT Manager, optional ?asset_id= or ?employee_id=
# ---------------------------------------------------------------------------
@issues_bp.get("")
@jwt_required
@roles_required("Admin", "IT Manager")
def list_issues():
    params = parse_pagination_params()
    query = Issue.query

    asset_id = request.args.get("asset_id", type=int)
    employee_id = request.args.get("employee_id", type=int)
    status_filter = request.args.get("status", "").strip()

    if asset_id:
        query = query.filter_by(asset_id=asset_id)
    if employee_id:
        query = query.filter_by(employee_id=employee_id)
    if status_filter:
        query = query.filter_by(status=status_filter)

    result = query.order_by(Issue.created_at.desc()).paginate(
        page=params.page,
        per_page=params.per_page,
        error_out=False,
    )
    return jsonify(
        pagination_response("issues", [i.to_dict() for i in result.items], result)
    ), 200


# ---------------------------------------------------------------------------
# GET /api/issues/asset/<asset_id>  — Admin / IT Manager
# ---------------------------------------------------------------------------
@issues_bp.get("/asset/<int:asset_id>")
@jwt_required
@roles_required("Admin", "IT Manager")
def issues_by_asset(asset_id: int):
    asset = Asset.query.get(asset_id)
    if not asset:
        return jsonify({"error": "Asset not found"}), 404

    params = parse_pagination_params()
    result = (
        Issue.query.filter_by(asset_id=asset_id)
        .order_by(Issue.created_at.desc())
        .paginate(page=params.page, per_page=params.per_page, error_out=False)
    )
    return jsonify(
        pagination_response("issues", [i.to_dict() for i in result.items], result)
    ), 200


# ---------------------------------------------------------------------------
# GET /api/issues/employee/<employee_id>  — Admin / IT Manager
# ---------------------------------------------------------------------------
@issues_bp.get("/employee/<int:employee_id>")
@jwt_required
@roles_required("Admin", "IT Manager")
def issues_by_employee(employee_id: int):
    employee = User.query.get(employee_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    params = parse_pagination_params()
    result = (
        Issue.query.filter_by(employee_id=employee_id)
        .order_by(Issue.created_at.desc())
        .paginate(page=params.page, per_page=params.per_page, error_out=False)
    )
    return jsonify(
        pagination_response("issues", [i.to_dict() for i in result.items], result)
    ), 200


# ---------------------------------------------------------------------------
# GET /api/issues/me  — any authenticated user sees their own issues
# ---------------------------------------------------------------------------
@issues_bp.get("/me")
@jwt_required
def my_issues():
    params = parse_pagination_params()
    result = (
        Issue.query.filter_by(employee_id=g.current_user_id)
        .order_by(Issue.created_at.desc())
        .paginate(page=params.page, per_page=params.per_page, error_out=False)
    )
    return jsonify(
        pagination_response("issues", [i.to_dict() for i in result.items], result)
    ), 200


# ---------------------------------------------------------------------------
# PATCH /api/issues/<id>/status  — Admin / IT Manager updates status
# ---------------------------------------------------------------------------
@issues_bp.patch("/<int:issue_id>/status")
@jwt_required
@roles_required("Admin", "IT Manager")
def update_issue_status(issue_id: int):
    issue = Issue.query.get(issue_id)
    if not issue:
        return jsonify({"error": "Issue not found"}), 404

    payload = request.get_json(silent=True) or {}
    new_status = (payload.get("status") or "").strip()

    if not new_status:
        raise APIError("status is required", 400)
    if new_status not in ALLOWED_ISSUE_STATUSES:
        return jsonify(
            {"error": f"Invalid status. Allowed: {ALLOWED_ISSUE_STATUSES}"}
        ), 400

    old_status = issue.status
    issue.status = new_status

    log = ActivityLog(
        user_id=g.current_user_id,
        action=(
            f"Updated issue #{issue.id} status from '{old_status}' to '{new_status}'"
        ),
    )
    db.session.add(log)

    if new_status == "Resolved":
        db.session.add(
            ActivityLog(
                user_id=g.current_user_id,
                action=(
                    f"Issue resolved: issue_id={issue.id}, asset_id={issue.asset_id}, "
                    f"employee_id={issue.employee_id}"
                ),
            )
        )
    db.session.commit()

    return jsonify({"message": "Issue status updated", "issue": issue.to_dict()}), 200
