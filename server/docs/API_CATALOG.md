# API Catalog

This file tracks all available APIs and the data each one needs.

## Base URLs

- `GET /` - Service info
- `GET /health` - Health check

## Authentication APIs

### 1) Register User

- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Auth required:** No
- **Request body (JSON):**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "strong-password",
  "department": "Finance"
}
```

- **Required fields:** `name`, `email`, `password`
- **Public signup role:** `Employee` only
- **Note:** `Admin` and `IT Manager` accounts cannot be created via public signup.

### 2) Login User

- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Auth required:** No
- **Request body (JSON):**

```json
{
  "email": "john@example.com",
  "password": "strong-password"
}
```

- **Required fields:** `email`, `password`
- **Response includes:** `access_token`, `token_type`, `user`

### 3) Current User Profile

- **Method:** `GET`
- **Path:** `/api/auth/me`
- **Auth required:** Yes (`Authorization: Bearer <token>`)
- **Request body:** None
- **Response includes:** logged-in `user` and role-based `permissions`

### 4) Feature Permission Check

- **Method:** `GET`
- **Path:** `/api/auth/can/<feature>`
- **Auth required:** Yes
- **Request body:** None
- **Path param:** `feature` (for example: `add_asset`, `assign_asset`, `view_own_assets`, `report_issue`)

### 5) RBAC Middleware Demo (Add Asset)

- **Method:** `GET`
- **Path:** `/api/auth/rbac-check/add-asset`
- **Auth required:** Yes
- **Access:** `Admin`, `IT Manager`

## Admin User Management APIs

### 6) View All Users

- **Method:** `GET`
- **Path:** `/api/admin/users`
- **Auth required:** Yes (`Authorization: Bearer <token>`)
- **Access:** `Admin` only
- **Request body:** None
- **Response includes:** list of all users

### 7) Update User Role

- **Method:** `PATCH`
- **Path:** `/api/admin/users/<user_id>/role`
- **Auth required:** Yes (`Authorization: Bearer <token>`)
- **Access:** `Admin` only
- **Request body (JSON):**

```json
{
  "role": "IT Manager"
}
```

- **Required fields:** `role`
- **Allowed roles:** `Admin`, `IT Manager`, `Employee`
- **Note:** Admin cannot change own role.

### 8) Create User Account (Admin)

- **Method:** `POST`
- **Path:** `/api/admin/users`
- **Auth required:** Yes (`Authorization: Bearer <token>`)
- **Access:** `Admin` only
- **Request body (JSON):**

```json
{
  "name": "Jane IT",
  "email": "jane.it@example.com",
  "password": "StrongPass@123",
  "role": "IT Manager",
  "department": "IT"
}
```

- **Required fields:** `name`, `email`, `password`, `role`
- **Allowed roles to create:** `IT Manager`, `Employee`
- **Note:** Admin account creation is not allowed through this endpoint.

## Asset Management APIs

Asset statuses:

- `Available`
- `Assigned`
- `Under Maintenance`
- `Retired`

### 9) Add Asset

- **Method:** `POST`
- **Path:** `/api/assets`
- **Auth required:** Yes (`Authorization: Bearer <token>`)
- **Access:** `Admin`, `IT Manager`
- **Request body (JSON):**

```json
{
  "asset_name": "Dell Latitude 5420",
  "category": "Laptop",
  "brand": "Dell",
  "model": "Latitude 5420",
  "serial_number": "DL-5420-12345",
  "purchase_date": "2026-01-15",
  "warranty_expiry": "2029-01-15",
  "status": "Available"
}
```

- **Required fields:** `asset_name`, `category`, `serial_number`, `status`

### 10) Update Asset

- **Method:** `PUT`
- **Path:** `/api/assets/<asset_id>`
- **Auth required:** Yes
- **Access:** `Admin`, `IT Manager`
- **Request body (JSON):** Any updatable asset fields.

### 11) Delete Asset

- **Method:** `DELETE`
- **Path:** `/api/assets/<asset_id>`
- **Auth required:** Yes
- **Access:** `Admin`, `IT Manager`

### 12) View All Assets

- **Method:** `GET`
- **Path:** `/api/assets`
- **Auth required:** Yes
- **Access:** `Admin`, `IT Manager`
- **Query params (optional):**
  - `q` for search
  - `status` for status filter

### 13) Search Asset

- **Method:** `GET`
- **Path:** `/api/assets/search`
- **Auth required:** Yes
- **Access:** `Admin`, `IT Manager`
- **Query params:** `q`

### 14) Filter by Status

- **Method:** `GET`
- **Path:** `/api/assets/filter`
- **Auth required:** Yes
- **Access:** `Admin`, `IT Manager`
- **Query params:** `status`

## Asset Assignment APIs

### 15) Assign Asset to Employee

- **Method:** `POST`
- **Path:** `/api/assignments`
- **Auth required:** Yes (`Authorization: Bearer <token>`)
- **Access:** `Admin`, `IT Manager`
- **Request body (JSON):**

```json
{
  "asset_id": 1,
  "employee_id": 5,
  "assigned_date": "2026-03-13"
}
```

- **Required fields:** `asset_id`, `employee_id`
- **Business rule:** Cannot assign an already assigned asset.

### 16) Return Assigned Asset

- **Method:** `PATCH`
- **Path:** `/api/assignments/<assignment_id>/return`
- **Auth required:** Yes
- **Access:** `Admin`, `IT Manager`
- **Request body (JSON):**

```json
{
  "return_date": "2026-03-20"
}
```

### 17) View All Assignments

- **Method:** `GET`
- **Path:** `/api/assignments`
- **Auth required:** Yes
- **Access:** `Admin`, `IT Manager`

### 18) View Assets Assigned to Employee

- **Method:** `GET`
- **Path:** `/api/assignments/employee/<employee_id>`
- **Auth required:** Yes
- **Access:** `Admin`, `IT Manager`

### 19) View My Assigned Assets

- **Method:** `GET`
- **Path:** `/api/assignments/me`
- **Auth required:** Yes
- **Access:** Any authenticated user

---

## Issues

### 20) Report an Issue

- **Method:** `POST`
- **Path:** `/api/issues`
- **Auth required:** Yes
- **Access:** Any authenticated user

**Request Body:**
```json
{
  "asset_id": 3,
  "issue_description": "Screen flickering when on battery power"
}
```

**Success Response `201`:**
```json
{
  "message": "Issue reported",
  "issue": {
    "id": 1,
    "asset_id": 3,
    "employee_id": 5,
    "issue_description": "Screen flickering when on battery power",
    "status": "Open",
    "created_at": "2026-03-13T10:00:00+00:00",
    "updated_at": "2026-03-13T10:00:00+00:00",
    "asset": { "id": 3, "name": "Dell Laptop", "...": "..." },
    "employee": { "id": 5, "name": "Alice", "email": "alice@co.com", "role": "Employee" }
  }
}
```

### 20) List Issues (with optional filters)

- **Method:** `GET`
- **Path:** `/api/issues`
- **Auth required:** Yes
- **Access:** `Admin`, `IT Manager`
- **Query params:** `asset_id`, `employee_id`, `status`

**Success Response `200`:**
```json
{ "issues": [ { "id": 1, "status": "Open", "...": "..." } ] }
```

### 21) Issues by Asset

- **Method:** `GET`
- **Path:** `/api/issues/asset/<asset_id>`
- **Auth required:** Yes
- **Access:** `Admin`, `IT Manager`

### 22) Issues by Employee

- **Method:** `GET`
- **Path:** `/api/issues/employee/<employee_id>`
- **Auth required:** Yes
- **Access:** `Admin`, `IT Manager`

### 23) My Issues

- **Method:** `GET`
- **Path:** `/api/issues/me`
- **Auth required:** Yes
- **Access:** Any authenticated user

**Success Response `200`:**
```json
{ "issues": [ { "id": 1, "status": "Open", "...": "..." } ] }
```

### 24) Update Issue Status

- **Method:** `PATCH`
- **Path:** `/api/issues/<issue_id>/status`
- **Auth required:** Yes
- **Access:** `Admin`, `IT Manager`

**Request Body:**
```json
{ "status": "In Progress" }
```

Allowed statuses: `Open`, `In Progress`, `Resolved`, `Closed`

**Success Response `200`:**
```json
{
  "message": "Issue status updated",
  "issue": { "id": 1, "status": "In Progress", "...": "..." }
}
```

---

## Maintenance

### 25) Add Maintenance Record

- **Method:** `POST`
- **Path:** `/api/maintenance`
- **Auth required:** Yes
- **Access:** `Admin`, `IT Manager`

**Request Body:**
```json
{
  "asset_id": 2,
  "maintenance_date": "2026-03-13",
  "technician": "Rahul Sharma",
  "description": "Replaced keyboard and updated BIOS",
  "cost": 1850.50
}
```

**Success Response `201`:**
```json
{
  "message": "Maintenance record added",
  "record": {
    "id": 1,
    "asset_id": 2,
    "maintenance_date": "2026-03-13",
    "technician": "Rahul Sharma",
    "description": "Replaced keyboard and updated BIOS",
    "cost": 1850.5,
    "asset": { "id": 2, "asset_name": "MacBook Pro", "...": "..." }
  }
}
```

### 26) View Maintenance History

- **Method:** `GET`
- **Path:** `/api/maintenance`
- **Auth required:** Yes
- **Access:** `Admin`, `IT Manager`
- **Query params:** `asset_id` (optional)

### 27) View Maintenance History by Asset

- **Method:** `GET`
- **Path:** `/api/maintenance/asset/<asset_id>`
- **Auth required:** Yes
- **Access:** `Admin`, `IT Manager`

**Success Response `200`:**
```json
{
  "asset": { "id": 2, "asset_name": "MacBook Pro", "...": "..." },
  "records": [
    {
      "id": 1,
      "maintenance_date": "2026-03-13",
      "technician": "Rahul Sharma",
      "description": "Replaced keyboard and updated BIOS",
      "cost": 1850.5
    }
  ]
}
```

---

## Dashboard

### 28) Dashboard Statistics

- **Method:** `GET`
- **Path:** `/api/dashboard/stats`
- **Auth required:** Yes
- **Access:** `Admin`, `IT Manager`

**Success Response `200`:**
```json
{
  "stats": {
    "total_assets": 120,
    "assigned_assets": 80,
    "available_assets": 25,
    "assets_under_maintenance": 15,
    "open_issues": 9
  }
}
```

---

## Authorization Matrix

| Feature | Admin | IT Manager | Employee |
|---|---|---|---|
| Add Asset | ✔ | ✔ | ❌ |
| Assign Asset | ✔ | ✔ | ❌ |
| View Own Assets | ✔ | ✔ | ✔ |
| Report Issue | ✔ | ✔ | ✔ |
| Update Issue Status | ✔ | ✔ | ❌ |
| View All Issues | ✔ | ✔ | ❌ |
| Add Maintenance Record | ✔ | ✔ | ❌ |
| View Maintenance History | ✔ | ✔ | ❌ |
| View Dashboard Stats | ✔ | ✔ | ❌ |

## Audit Logging

The following events are stored in `activity_logs` with fields `user_id`, `action`, and `timestamp`:

- Asset creation
- Asset assignment
- Issue reported
- Issue resolved

## Production Conventions

- Pagination for list endpoints uses query params: `page` (default `1`) and `per_page` (default `10`, capped by server config).
- Paginated responses include:
  - `pagination.page`
  - `pagination.per_page`
  - `pagination.total`
  - `pagination.pages`
  - `pagination.has_next`
  - `pagination.has_prev`
- Validation and runtime errors return JSON in shape: `{ "error": "<message>" }`.
- Security headers are added on all responses (`CSP`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).

## Token Header Format

```http
Authorization: Bearer <access_token>
```