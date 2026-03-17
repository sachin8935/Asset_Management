ROLES = {"Admin", "IT Manager", "Employee"}

FEATURE_ACCESS = {
    "add_asset": {"Admin", "IT Manager"},
    "assign_asset": {"Admin", "IT Manager"},
    "view_own_assets": {"Admin", "IT Manager", "Employee"},
    "report_issue": {"Admin", "IT Manager", "Employee"},
}


def role_has_feature(role: str, feature: str) -> bool:
    return role in FEATURE_ACCESS.get(feature, set())