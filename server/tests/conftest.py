import pytest

from app import create_app
from app.auth.jwt_utils import create_access_token
from app.extensions import db
from app.models import User


class TestConfig:
    TESTING = True
    SECRET_KEY = "test-secret"
    SQLALCHEMY_DATABASE_URI = "sqlite+pysqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ALGORITHM = "HS256"
    JWT_EXP_HOURS = 12
    MAX_PER_PAGE = 100
    MAX_CONTENT_LENGTH = 1024 * 1024


@pytest.fixture()
def app():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def admin_auth_header(app):
    with app.app_context():
        user = User(
            name="Admin User",
            email="admin@example.com",
            password="hashed",
            role="Admin",
            department="IT",
        )
        db.session.add(user)
        db.session.commit()
        token = create_access_token(user.id, user.role)
        return {"Authorization": f"Bearer {token}"}
