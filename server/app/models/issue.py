from sqlalchemy import CheckConstraint
from sqlalchemy.sql import func

from ..extensions import db

ALLOWED_ISSUE_STATUSES = ["Open", "In Progress", "Resolved", "Closed"]


class Issue(db.Model):
    __tablename__ = "issues"

    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey("assets.id"), nullable=False, index=True)
    employee_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    issue_description = db.Column(db.Text, nullable=False)
    status = db.Column(
        db.String(50),
        nullable=False,
        default="Open",
        server_default="Open",
    )
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = db.Column(
        db.DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('Open', 'In Progress', 'Resolved', 'Closed')",
            name="ck_issues_status",
        ),
    )

    asset = db.relationship("Asset", back_populates="issues")
    employee = db.relationship("User", back_populates="issues")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "asset_id": self.asset_id,
            "employee_id": self.employee_id,
            "issue_description": self.issue_description,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "asset": self.asset.to_dict() if self.asset else None,
            "employee": {
                "id": self.employee.id,
                "name": self.employee.name,
                "email": self.employee.email,
                "role": self.employee.role,
            } if self.employee else None,
        }