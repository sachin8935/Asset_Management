from datetime import date

from ..extensions import db


class MaintenanceRecord(db.Model):
    __tablename__ = "maintenance_records"

    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey("assets.id"), nullable=False, index=True)
    maintenance_date = db.Column(db.Date, nullable=False, default=date.today)
    technician = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    cost = db.Column(db.Numeric(10, 2), nullable=False, default=0)

    asset = db.relationship("Asset", back_populates="maintenance_records")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "asset_id": self.asset_id,
            "maintenance_date": self.maintenance_date.isoformat() if self.maintenance_date else None,
            "technician": self.technician,
            "description": self.description,
            "cost": float(self.cost) if self.cost is not None else None,
            "asset": self.asset.to_dict() if self.asset else None,
        }