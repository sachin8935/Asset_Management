from datetime import datetime
from decimal import Decimal, InvalidOperation

from flask import Blueprint, g, jsonify, request

from ..api_utils import (
    APIError,
    pagination_response,
    parse_pagination_params,
    require_non_empty_string,
)
from ..auth.middleware import jwt_required, roles_required
from ..extensions import db
from ..models import ActivityLog, Asset, MaintenanceRecord

maintenance_bp = Blueprint("maintenance", __name__, url_prefix="/api/maintenance")


def _parse_date_or_today(value):
    if value in (None, ""):
        return datetime.utcnow().date()
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError as exc:
        raise APIError("maintenance_date must be in YYYY-MM-DD format", 400) from exc


def _parse_cost(value):
    if value in (None, ""):
        return Decimal("0")
    try:
        parsed = Decimal(str(value))
    except (InvalidOperation, TypeError) as exc:
        raise APIError("cost must be a valid number", 400) from exc

    if parsed < 0:
        raise APIError("cost cannot be negative", 400)
    return parsed


@maintenance_bp.post("")
@jwt_required
@roles_required("Admin", "IT Manager")
def add_maintenance_record():
    payload = request.get_json(silent=True) or {}

    asset_id = payload.get("asset_id")
    technician = require_non_empty_string(payload, "technician", max_length=150)
    description = (payload.get("description") or "").strip() or None

    if not asset_id:
        raise APIError("asset_id is required", 400)

    asset = Asset.query.get(asset_id)
    if not asset:
        return jsonify({"error": "Asset not found"}), 404

    maintenance_date = _parse_date_or_today(payload.get("maintenance_date"))
    cost = _parse_cost(payload.get("cost"))

    record = MaintenanceRecord(
        asset_id=asset.id,
        maintenance_date=maintenance_date,
        technician=technician,
        description=description,
        cost=cost,
    )

    db.session.add(record)

    db.session.add(
        ActivityLog(
            user_id=g.current_user_id,
            action=f"Added maintenance record for asset '{asset.asset_name}'",
        )
    )

    if asset.status != "Retired":
        asset.status = "Under Maintenance"

    db.session.commit()
    return jsonify({"message": "Maintenance record added", "record": record.to_dict()}), 201


@maintenance_bp.get("")
@jwt_required
@roles_required("Admin", "IT Manager")
def view_maintenance_history():
    params = parse_pagination_params()
    asset_id = request.args.get("asset_id", type=int)

    query = MaintenanceRecord.query
    if asset_id:
        query = query.filter_by(asset_id=asset_id)

    result = query.order_by(
        MaintenanceRecord.maintenance_date.desc(),
        MaintenanceRecord.id.desc(),
    ).paginate(page=params.page, per_page=params.per_page, error_out=False)
    return jsonify(
        pagination_response("records", [record.to_dict() for record in result.items], result)
    ), 200


@maintenance_bp.get("/asset/<int:asset_id>")
@jwt_required
@roles_required("Admin", "IT Manager")
def view_asset_maintenance_history(asset_id: int):
    asset = Asset.query.get(asset_id)
    if not asset:
        return jsonify({"error": "Asset not found"}), 404

    params = parse_pagination_params()
    result = (
        MaintenanceRecord.query.filter_by(asset_id=asset_id)
        .order_by(MaintenanceRecord.maintenance_date.desc(), MaintenanceRecord.id.desc())
        .paginate(page=params.page, per_page=params.per_page, error_out=False)
    )

    payload = pagination_response(
        "records",
        [record.to_dict() for record in result.items],
        result,
    )
    payload["asset"] = asset.to_dict()

    return jsonify(payload), 200
