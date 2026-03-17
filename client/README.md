# Frontend Routes and API Endpoints

This README documents:

- Frontend routes available in the React app
- Backend API endpoints called by the frontend service layer

---

## Frontend Routes

Defined in `src/App.jsx`.

| Route | Access |
| --- | --- |
| `/login` | Public |
| `/dashboard` | Admin, IT Manager |
| `/assets` | Admin, IT Manager |
| `/assignments` | Admin, IT Manager |
| `/my-assets` | Any authenticated user |
| `/report-issues` | Any authenticated user |
| `/issues` | Admin, IT Manager |
| `/users` | Admin only |
| `/` | Redirects to default route based on role |
| `*` | Redirects to role-based default route |

Default route behavior:

- Admin / IT Manager → `/dashboard`
- Employee → `/my-assets`

Auth behavior on `/login` page:

- Admin: Login only
- IT Manager: Login only (account created by Admin)
- Employee: Login or Signup

---

## API Base

Frontend calls relative API paths through `fetch`:

- Base prefix: `/api`
- Auth header format: `Authorization: Bearer <token>`

---

## API Endpoints Used by Frontend

### Auth (`src/services/authService.js`)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Login user |

### Dashboard (`src/services/dashboardService.js`)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/dashboard/stats` | Load dashboard stats |

### Assets (`src/services/assetService.js`)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/assets?q=&status=&page=&per_page=` | List/search/filter assets |
| `POST` | `/api/assets` | Add asset |
| `PUT` | `/api/assets/:assetId` | Update asset |
| `DELETE` | `/api/assets/:assetId` | Delete asset |

### Assignments (`src/services/assignmentService.js`)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/assignments?page=&per_page=` | List assignments |
| `POST` | `/api/assignments` | Assign asset to employee |
| `PATCH` | `/api/assignments/:assignmentId/return` | Return assigned asset |
| `GET` | `/api/assignments/employee/:employeeId?page=&per_page=` | List assignments by employee |
| `GET` | `/api/assignments/me?page=&per_page=` | List my assignments |

### Issues (`src/services/issueService.js`)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/issues` | Report issue |
| `GET` | `/api/issues?asset_id=&employee_id=&status=&page=&per_page=` | List issues with filters |
| `GET` | `/api/issues/asset/:assetId` | Get issues by asset |
| `GET` | `/api/issues/employee/:employeeId` | Get issues by employee |
| `GET` | `/api/issues/me?page=&per_page=` | Get my issues |
| `PATCH` | `/api/issues/:issueId/status` | Update issue status |

### Maintenance (`src/services/maintenanceService.js`)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/maintenance` | Add maintenance record |
| `GET` | `/api/maintenance?asset_id=&page=&per_page=` | List maintenance history |
| `GET` | `/api/maintenance/asset/:assetId?page=&per_page=` | Get maintenance history by asset |

### Admin Users (`src/services/adminService.js`)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/admin/users?page=&per_page=` | List users (admin) |
| `POST` | `/api/admin/users` | Create IT Manager / Employee account (admin) |
| `PATCH` | `/api/admin/users/:userId/role` | Update user role (admin) |

---

## Notes

- Route access control is enforced in `ProtectedRoute` within `src/App.jsx`.
- API calls are centralized in `src/services/*` and executed via `src/services/apiClient.js`.
- For complete backend contract details, see `server/docs/API_CATALOG.md`.
