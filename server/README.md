# Asset Management Backend

## Folder Structure

```
server/
  app.py
  requirements.txt
  .env.example
  README.md
  app/
    __init__.py
    config.py
    extensions.py
    models/
      __init__.py
      user.py
      asset.py
      asset_assignment.py
      issue.py
      maintenance_record.py
      activity_log.py
  db/
    schema.sql
  docs/
    API_CATALOG.md
```

## PostgreSQL Tables Implemented

1. users
2. assets
3. asset_assignments
4. issues
5. maintenance_records
6. activity_logs

## Authentication Implemented

- User registration API
- User login API
- Password hashing (`werkzeug.security`)
- JWT authentication (`PyJWT`)
- Role-based and permission-based middleware
- Public signup restricted to `Employee` accounts only
- `Admin` and `IT Manager` accounts are login-only
- Admin can create `IT Manager` and `Employee` accounts

Roles:

- Admin
- IT Manager
- Employee

Default admin bootstrap:

- On app startup, if no Admin exists, one default Admin user is created using environment variables:
  - `DEFAULT_ADMIN_NAME`
  - `DEFAULT_ADMIN_EMAIL`
  - `DEFAULT_ADMIN_PASSWORD`

See full endpoint contracts in `docs/API_CATALOG.md`.

## Setup

1. Create and activate virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Copy environment file and update DB credentials:

```bash
cp .env.example .env
```

4. Create the database tables directly in PostgreSQL:

```bash
psql -U postgres -d asset_management -f db/schema.sql
```

## Run

```bash
python app.py
```

Health check route: `GET /health`