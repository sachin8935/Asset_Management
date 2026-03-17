from flask import Flask
from sqlalchemy import inspect
from sqlalchemy.exc import OperationalError
from werkzeug.exceptions import HTTPException
from werkzeug.security import generate_password_hash

from .api_utils import APIError
from .config import Config
from .extensions import db, migrate
from .routes import admin_bp, assets_bp, assignments_bp, auth_bp, dashboard_bp, issues_bp, maintenance_bp


def ensure_default_admin(app: Flask) -> None:
    with app.app_context():
        try:
            inspector = inspect(db.engine)
            if not inspector.has_table("users"):
                return
        except OperationalError:
            return

        from .models import User

        admin_exists = User.query.filter_by(role="Admin").first()
        if admin_exists:
            return

        user = User(
            name=app.config["DEFAULT_ADMIN_NAME"],
            email=app.config["DEFAULT_ADMIN_EMAIL"].strip().lower(),
            password=generate_password_hash(app.config["DEFAULT_ADMIN_PASSWORD"]),
            role="Admin",
            department="Administration",
        )
        db.session.add(user)
        db.session.commit()


def create_app(config_object: type[Config] = Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_object)

    db.init_app(app)
    migrate.init_app(app, db)

    from . import models  # noqa: F401
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(assets_bp)
    app.register_blueprint(assignments_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(issues_bp)
    app.register_blueprint(maintenance_bp)
    ensure_default_admin(app)

    @app.get("/")
    def home() -> dict[str, str]:
        return {"message": "Asset Management API"}

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.after_request
    def add_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["X-XSS-Protection"] = "0"
        response.headers["Content-Security-Policy"] = "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'"
        return response

    @app.errorhandler(APIError)
    def handle_api_error(err: APIError):
        return {"error": err.message}, err.status_code

    @app.errorhandler(HTTPException)
    def handle_http_exception(err: HTTPException):
        return {"error": err.description}, err.code

    @app.errorhandler(Exception)
    def handle_unexpected_exception(_err: Exception):
        db.session.rollback()
        return {"error": "Internal server error"}, 500

    return app