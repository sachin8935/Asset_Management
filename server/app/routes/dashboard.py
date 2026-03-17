from flask import Blueprint, jsonify

from ..auth.middleware import jwt_required, roles_required
from ..models import Asset, Issue

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.get("/stats")
@jwt_required
@roles_required("Admin", "IT Manager")
def get_dashboard_stats():
    total_assets = Asset.query.count()
    assigned_assets = Asset.query.filter_by(status="Assigned").count()
    available_assets = Asset.query.filter_by(status="Available").count()
    assets_under_maintenance = Asset.query.filter_by(status="Under Maintenance").count()
    open_issues = Issue.query.filter_by(status="Open").count()

    return jsonify(
        {
            "stats": {
                "total_assets": total_assets,
                "assigned_assets": assigned_assets,
                "available_assets": available_assets,
                "assets_under_maintenance": assets_under_maintenance,
                "open_issues": open_issues,
            }
        }
    ), 200
