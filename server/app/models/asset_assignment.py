from datetime import date

from ..extensions import db


class AssetAssignment(db.Model):
    __tablename__ = "asset_assignments"

    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey("assets.id"), nullable=False, index=True)
    employee_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    assigned_date = db.Column(db.Date, nullable=False, default=date.today)
    return_date = db.Column(db.Date, nullable=True)

    asset = db.relationship("Asset", back_populates="assignments")
    employee = db.relationship("User", back_populates="assignments")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "asset_id": self.asset_id,
            "employee_id": self.employee_id,
            "assigned_date": self.assigned_date.isoformat() if self.assigned_date else None,
            "return_date": self.return_date.isoformat() if self.return_date else None,
            "asset": self.asset.to_dict() if self.asset else None,
            "employee": self.employee.to_dict() if self.employee else None,
        }