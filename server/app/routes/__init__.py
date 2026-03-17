from .admin import admin_bp
from .assets import assets_bp
from .assignments import assignments_bp
from .auth import auth_bp
from .dashboard import dashboard_bp
from .issues import issues_bp
from .maintenance import maintenance_bp

__all__ = [
	"auth_bp",
	"admin_bp",
	"assets_bp",
	"assignments_bp",
	"dashboard_bp",
	"issues_bp",
	"maintenance_bp",
]