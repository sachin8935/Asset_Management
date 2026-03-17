from ..extensions import db


ALLOWED_ASSET_STATUSES = [
    "Available",
    "Assigned",
    "Under Maintenance",
    "Retired",
]


class Asset(db.Model):
    __tablename__ = "assets"
    __table_args__ = (
        db.CheckConstraint(
            "status IN ('Available', 'Assigned', 'Under Maintenance', 'Retired')",
            name="chk_asset_status",
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    asset_name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    brand = db.Column(db.String(100), nullable=True)
    model = db.Column(db.String(100), nullable=True)
    serial_number = db.Column(db.String(120), unique=True, nullable=False, index=True)
    purchase_date = db.Column(db.Date, nullable=True)
    warranty_expiry = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(50), nullable=False, default="Available")

    assignments = db.relationship(
        "AssetAssignment",
        back_populates="asset",
        cascade="all, delete-orphan",
    )
    issues = db.relationship(
        "Issue",
        back_populates="asset",
        cascade="all, delete-orphan",
    )
    maintenance_records = db.relationship(
        "MaintenanceRecord",
        back_populates="asset",
        cascade="all, delete-orphan",
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "asset_name": self.asset_name,
            "category": self.category,
            "brand": self.brand,
            "model": self.model,
            "serial_number": self.serial_number,
            "purchase_date": self.purchase_date.isoformat() if self.purchase_date else None,
            "warranty_expiry": self.warranty_expiry.isoformat() if self.warranty_expiry else None,
            "status": self.status,
        }