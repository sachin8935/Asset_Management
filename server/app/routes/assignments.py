from datetime import datetime

from flask import Blueprint, g, jsonify, request

from ..api_utils import APIError, pagination_response, parse_pagination_params
from ..auth.middleware import jwt_required, roles_required
from ..extensions import db
from ..models import ActivityLog, Asset, AssetAssignment, User

assignments_bp = Blueprint("assignments", __name__, url_prefix="/api/assignments")


def _parse_date_or_today(value):
    if value in (None, ""):
        return datetime.utcnow().date()
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError as exc:
        raise APIError("Date must be in YYYY-MM-DD format", 400) from exc


def _parse_optional_date(value):
    if value in (None, ""):
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError as exc:
        raise APIError("Date must be in YYYY-MM-DD format", 400) from exc


@assignments_bp.post("")
@jwt_required
@roles_required("Admin", "IT Manager")
def assign_asset_to_employee():
    payload = request.get_json(silent=True) or {}
    asset_id = payload.get("asset_id")
    employee_id = payload.get("employee_id")

    if not asset_id or not employee_id:
        raise APIError("asset_id and employee_id are required", 400)

    asset = Asset.query.get(asset_id)
    if not asset:
        return jsonify({"error": "Asset not found"}), 404

    employee = User.query.get(employee_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    active_assignment = AssetAssignment.query.filter_by(
        asset_id=asset.id,
        return_date=None,
    ).first()
    if active_assignment or asset.status == "Assigned":
        return jsonify({"error": "Asset is already assigned"}), 409

    try:
        assignment = AssetAssignment(
            asset_id=asset.id,
            employee_id=employee.id,
            assigned_date=_parse_date_or_today(payload.get("assigned_date")),
        )
        asset.status = "Assigned"

        db.session.add(assignment)
        db.session.flush()
        db.session.add(
            ActivityLog(
                user_id=g.current_user_id,
                action=(
                    f"Asset assignment: assignment_id={assignment.id}, "
                    f"asset_id={asset.id}, employee_id={employee.id}"
                ),
            )
        )
        db.session.commit()
        return jsonify(
            {
                "message": "Asset assigned successfully",
                "assignment": assignment.to_dict(),
            }
        ), 201
    except APIError as exc:
        db.session.rollback()
        raise exc


@assignments_bp.patch("/<int:assignment_id>/return")
@jwt_required
@roles_required("Admin", "IT Manager")
def return_assigned_asset(assignment_id: int):
    assignment = AssetAssignment.query.get(assignment_id)
    if not assignment:
        return jsonify({"error": "Assignment not found"}), 404

    if assignment.return_date is not None:
        return jsonify({"error": "Asset already returned"}), 409

    payload = request.get_json(silent=True) or {}
    try:
        return_date = _parse_optional_date(payload.get("return_date")) or datetime.utcnow().date()
        if return_date < assignment.assigned_date:
            raise APIError("return_date cannot be before assigned_date", 400)

        assignment.return_date = return_date
        assignment.asset.status = "Available"

        db.session.add(
            ActivityLog(
                user_id=g.current_user_id,
                action=(
                    f"Returned asset: assignment_id={assignment.id}, "
                    f"asset_id={assignment.asset_id}"
                ),
            )
        )
        db.session.commit()
        return jsonify(
            {
                "message": "Asset returned successfully",
                "assignment": assignment.to_dict(),
            }
        )
    except APIError as exc:
        db.session.rollback()
        raise exc


@assignments_bp.get("")
@jwt_required
@roles_required("Admin", "IT Manager")
def view_all_assignments():
    params = parse_pagination_params()
    result = AssetAssignment.query.order_by(AssetAssignment.id.desc()).paginate(
        page=params.page,
        per_page=params.per_page,
        error_out=False,
    )
    return jsonify(
        pagination_response(
            "assignments",
            [assignment.to_dict() for assignment in result.items],
            result,
        )
    )


@assignments_bp.get("/employee/<int:employee_id>")
@jwt_required
@roles_required("Admin", "IT Manager")
def view_assets_assigned_to_employee(employee_id: int):
    employee = User.query.get(employee_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    params = parse_pagination_params()
    result = (
        AssetAssignment.query.filter_by(employee_id=employee.id)
        .order_by(AssetAssignment.id.desc())
        .paginate(page=params.page, per_page=params.per_page, error_out=False)
    )
    payload = pagination_response(
        "assignments",
        [assignment.to_dict() for assignment in result.items],
        result,
    )
    payload["employee"] = employee.to_dict()
    return jsonify(payload)


@assignments_bp.get("/me")
@jwt_required
def view_my_assigned_assets():
    params = parse_pagination_params()
    result = (
        AssetAssignment.query.filter_by(employee_id=g.current_user_id)
        .order_by(AssetAssignment.id.desc())
        .paginate(page=params.page, per_page=params.per_page, error_out=False)
    )
    return jsonify(
        pagination_response(
            "assignments",
            [assignment.to_dict() for assignment in result.items],
            result,
        )
    )