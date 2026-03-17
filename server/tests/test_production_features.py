def test_assets_pagination_returns_metadata(client, admin_auth_header):
    for idx in range(15):
        payload = {
            "asset_name": f"Laptop {idx}",
            "category": "Laptop",
            "serial_number": f"SERIAL-{idx}",
            "status": "Available",
        }
        response = client.post("/api/assets", json=payload, headers=admin_auth_header)
        assert response.status_code == 201

    response = client.get("/api/assets?page=2&per_page=10", headers=admin_auth_header)
    assert response.status_code == 200

    body = response.get_json()
    assert len(body["assets"]) == 5
    assert body["pagination"]["page"] == 2
    assert body["pagination"]["per_page"] == 10
    assert body["pagination"]["total"] == 15
    assert body["pagination"]["pages"] == 2


def test_invalid_pagination_returns_validation_error(client, admin_auth_header):
    response = client.get("/api/assets?page=0&per_page=10", headers=admin_auth_header)
    assert response.status_code == 400
    assert response.get_json()["error"] == "page must be a positive integer"


def test_security_headers_present_on_response(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("Referrer-Policy") == "no-referrer"
    assert "default-src 'self'" in (response.headers.get("Content-Security-Policy") or "")
