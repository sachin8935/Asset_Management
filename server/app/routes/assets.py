from datetime import datetime

from flask import Blueprint, g, jsonify, request
from sqlalchemy import or_

from ..api_utils import (
    APIError,
    optional_trimmed_string,
    pagination_response,
    parse_pagination_params,
    require_non_empty_string,
)
from ..auth.middleware import jwt_required, roles_required
from ..extensions import db
from ..models import ActivityLog, Asset
from ..models.asset import ALLOWED_ASSET_STATUSES

assets_bp = Blueprint("assets", __name__, url_prefix="/api/assets")


def _parse_optional_date(value):
    if value in (None, ""):
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError as exc:
        raise APIError("Date must be in YYYY-MM-DD format", 400) from exc


def _validate_status(status: str):
    if status not in ALLOWED_ASSET_STATUSES:
        raise APIError(
            f"Invalid status. Allowed statuses: {', '.join(ALLOWED_ASSET_STATUSES)}"
        )


def _asset_query_from_params():
    query = Asset.query

    q = (request.args.get("q") or "").strip()
    if q:
        like_query = f"%{q}%"
        query = query.filter(
            or_(
                Asset.asset_name.ilike(like_query),
                Asset.category.ilike(like_query),
                Asset.brand.ilike(like_query),
                Asset.model.ilike(like_query),
                Asset.serial_number.ilike(like_query),
            )
        )

    status = (request.args.get("status") or "").strip()
    if status:
        _validate_status(status)
        query = query.filter(Asset.status == status)

    return query.order_by(Asset.id.asc())


@assets_bp.post("")
@jwt_required
@roles_required("Admin", "IT Manager")
def add_asset():
    payload = request.get_json(silent=True) or {}

    try:
        asset_name = require_non_empty_string(payload, "asset_name", max_length=150)
        category = require_non_empty_string(payload, "category", max_length=100)
        serial_number = require_non_empty_string(payload, "serial_number", max_length=120)
        status = require_non_empty_string(payload, "status", max_length=50)
        _validate_status(status)

        asset = Asset(
            asset_name=asset_name,
            category=category,
            brand=optional_trimmed_string(payload, "brand", max_length=100),
            model=optional_trimmed_string(payload, "model", max_length=100),
            serial_number=serial_number,
            purchase_date=_parse_optional_date(payload.get("purchase_date")),
            warranty_expiry=_parse_optional_date(payload.get("warranty_expiry")),
            status=status,
        )

        existing = Asset.query.filter_by(serial_number=asset.serial_number).first()
        if existing:
            return jsonify({"error": "Asset with this serial number already exists"}), 409

        db.session.add(asset)
        db.session.flush()
        db.session.add(
            ActivityLog(
                user_id=g.current_user_id,
                action=(
                    f"Asset creation: asset_id={asset.id}, serial={asset.serial_number}, "
                    f"asset_name='{asset.asset_name}'"
                ),
            )
        )
        db.session.commit()
        return jsonify({"message": "Asset added successfully", "asset": asset.to_dict()}), 201
    except APIError as exc:
        db.session.rollback()
        raise exc


@assets_bp.put("/<int:asset_id>")
@jwt_required
@roles_required("Admin", "IT Manager")
def update_asset(asset_id: int):
    payload = request.get_json(silent=True) or {}
    asset = Asset.query.get(asset_id)
    if not asset:
        return jsonify({"error": "Asset not found"}), 404

    try:
        if "asset_name" in payload:
            asset.asset_name = require_non_empty_string(payload, "asset_name", max_length=150)
        if "category" in payload:
            asset.category = require_non_empty_string(payload, "category", max_length=100)
        if "brand" in payload:
            asset.brand = optional_trimmed_string(payload, "brand", max_length=100)
        if "model" in payload:
            asset.model = optional_trimmed_string(payload, "model", max_length=100)
        if "serial_number" in payload:
            new_serial = require_non_empty_string(payload, "serial_number", max_length=120)
            existing = Asset.query.filter(
                Asset.serial_number == new_serial,
                Asset.id != asset.id,
            ).first()
            if existing:
                return jsonify({"error": "Asset with this serial number already exists"}), 409
            asset.serial_number = new_serial
        if "purchase_date" in payload:
            asset.purchase_date = _parse_optional_date(payload.get("purchase_date"))
        if "warranty_expiry" in payload:
            asset.warranty_expiry = _parse_optional_date(payload.get("warranty_expiry"))
        if "status" in payload:
            status = (payload.get("status") or "").strip()
            _validate_status(status)
            asset.status = status

        db.session.add(
            ActivityLog(
                user_id=g.current_user_id,
                action=f"Updated asset: asset_id={asset.id}",
            )
        )
        db.session.commit()
        return jsonify({"message": "Asset updated successfully", "asset": asset.to_dict()})
    except APIError as exc:
        db.session.rollback()
        raise exc


@assets_bp.delete("/<int:asset_id>")
@jwt_required
@roles_required("Admin", "IT Manager")
def delete_asset(asset_id: int):
    asset = Asset.query.get(asset_id)
    if not asset:
        return jsonify({"error": "Asset not found"}), 404

    db.session.delete(asset)
    db.session.add(
        ActivityLog(
            user_id=g.current_user_id,
            action=f"Deleted asset: asset_id={asset_id}",
        )
    )
    db.session.commit()
    return jsonify({"message": "Asset deleted successfully"})


@assets_bp.get("")
@jwt_required
@roles_required("Admin", "IT Manager")
def view_all_assets():
    params = parse_pagination_params()
    result = _asset_query_from_params().paginate(
        page=params.page,
        per_page=params.per_page,
        error_out=False,
    )
    return jsonify(
        pagination_response("assets", [asset.to_dict() for asset in result.items], result)
    )


@assets_bp.get("/search")
@jwt_required
@roles_required("Admin", "IT Manager")
def search_asset():
    return view_all_assets()


@assets_bp.get("/filter")
@jwt_required
@roles_required("Admin", "IT Manager")
def filter_by_status():
    return view_all_assets()