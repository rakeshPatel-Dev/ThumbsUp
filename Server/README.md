# Thumbsup Server

Task Approval Management System — Backend API server built with Node.js, Express, and MongoDB (Mongoose).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MongoDB (Mongoose 9) |
| Auth | JWT (HTTP-Only Cookies) |
| Password Hashing | bcryptjs |
| Validation | validator |
| Language | JavaScript (ESM) |

## Quick Start

### Prerequisites

- Node.js >= 18
- MongoDB instance (local or Atlas)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the server root:

```env
MONGOOSE_URI=mongodb://localhost:27017/thumbsup
JWT_SECRET=your_jwt_secret_here
PORT=3000
```

### Run

```bash
node server.js
```

Server starts on **port 3000**. MongoDB connects first, then Express starts listening.

## Project Structure

```
Server/
├── server.js                  # Entry point — connects DB, starts server
├── app.js                     # Express app setup — CORS, JSON, cookies, routes
├── package.json               # Dependencies and metadata
├── .gitignore                 # Git ignore rules
│
├── src/
│   ├── config/
│   │   └── mongoose.config.js # MongoDB connection with caching (hot-reload safe)
│   │
│   ├── models/
│   │   ├── User.js            # User schema (email, password, role, etc.)
│   │   ├── Task.js            # Task schema (title, status, priority, etc.)
│   │   └── Notifications.js   # Notification schema (schema only — no model export)
│   │
│   ├── controller/            # Request handlers
│   │   ├── auth.controller.js # register, login, logout, forgotPassword
│   │   ├── user.conroller.js  # Profile retrieval (typo in filename)
│   │   ├── taskController.js  # CRUD + pagination + filtering + sorting
│   │   └── notification.controller.js  # Stub only
│   │
│   ├── routes/
│   │   ├── mainRoutes.js      # Route aggregator (/auth, /tasks)
│   │   ├── userRoutes.js      # /api/auth/* endpoints
│   │   ├── taskRoutes.js      # /api/tasks/* endpoints
│   │   ├── notificationRoutes.js  # Stub only
│   │   └── adminRoutes.js     # Empty file
│   │
│   └── middlewares/
│       ├── auth.js            # JWT verification from cookie or Bearer header
│       └── role.middleware.js  # Role-based access control
```

## API Endpoints

### Base URL: `http://localhost:3000/api`

All routes are prefixed with `/api`.

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login, returns JWT in HTTP-Only cookie |
| GET | `/api/auth/me` | Yes | Get current user profile |
| POST | `/api/auth/logout` | Yes | Clear auth cookie |

### Tasks — `/api/tasks`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/tasks` | Yes | Any | Create a task |
| GET | `/api/tasks` | Yes | Admin | Get all tasks (paginated, filterable) |
| GET | `/api/tasks/:id` | Yes | Any | Get task by ID |
| PUT | `/api/tasks/updateTask/:id` | Yes | Any | Update own task |
| DELETE | `/api/tasks/:id` | Yes | Admin | Delete a task |

### Standard Response Format

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response Format

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description"
}
```

## Authentication

JWT-based authentication using **HTTP-Only cookies**.

1. **Login** sets a `token` cookie (signed JWT with `{id, email, role}`, 5h expiry).
2. **Authenticate** via `auth.js` middleware — reads from `req.cookies.token` or `Authorization: Bearer <token>` header.
3. **Role check** via `authorizeRoles(...roles)` middleware — restricts access by `req.user.role`.

### Allowed Roles

- `user` — default, can create/update own tasks
- `admin` — can view all tasks, delete tasks

## Database Design

### Collections (currently implemented)

#### User (`models/User.js`)
| Field | Type | Notes |
|-------|------|-------|
| email | String | Required |
| fullname | String | Required |
| password | String | Required, bcrypt-hashed |
| role | String | Enum: `user`, `admin` (default: `user`) |
| avatar | String | Profile picture URL |
| isactive | Boolean | Default: `true` |
| isEmailVerified | Boolean | Default: `false` |
| refreshToken | String | JWT refresh token |
| lastLogin | Date | Last login timestamp |

#### Task (`models/Task.js`)
| Field | Type | Notes |
|-------|------|-------|
| title | String | Required |
| description | String | Required |
| priority | String | Enum: `low`, `medium`, `high` |
| deadline | Date | Task deadline |
| category | String | Task category |
| status | String | Enum: `pending`, `approved` |
| rejectionReason | String | Reason if rejected |
| createdBy | ObjectId | Ref: User, required |

#### Notification (`models/Notifications.js`)
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | Ref: User, required |
| title | String | Required |
| message | String | Required |
| type | String | Enum: `info`, `warning`, `error`, `success` |
| isRead | Boolean | Default: `false` |

All models use automatic `createdAt` / `updatedAt` timestamps.

## Middleware

| Middleware | Status | Description |
|------------|--------|-------------|
| `auth.js` | Done | JWT verification from cookie (`token`) or `Authorization: Bearer` header |
| `role.middleware.js` | Done | Restricts routes by role (`authorizeRoles("admin")`) |

## Controllers

### Auth Controller (`auth.controller.js`)
- `registerUser` — validates fields, checks uniqueness (email/username), hashes password with bcryptjs (10 rounds), creates user. Returns 201 on success.
- `loginUser` — validates credentials, finds user by email, compares password, generates JWT (5h expiry), sets HTTP-Only cookie (`sameSite: Strict`), returns user data + token.
- `logoutUser` — clears `token` cookie.
- `forgotPassword` — checks email exists, returns success message (no actual email sending).

### User Controller (`user.conroller.js`)
- `Profile` — fetches user by `req.user.id`, returns user data.

### Task Controller (`taskController.js`)
- `createTask` — validates all required fields (title, description, priority, deadline, category, attachment), validates deadline, creates task with `status: "pending"` and `createdBy: req.user.id`, populates createdBy.
- `getTask` — full-featured pagination + filtering + sorting + stats. Filters by status, priority, category, search (title/description regex), date range. Role-based: users see only their own tasks, admins see all. Returns paginated tasks with pending/approved/rejected/completed counts.
- `getTaskById` — fetches single task by ID.
- `deleteTask` — finds and deletes task by ID (admin only).
- `updateTask` — finds task by ID + `createdBy`, applies `Object.assign(task, req.body)`, saves.

## Task Query Features

The `GET /api/tasks` endpoint supports:

- **Pagination**: `page` (default 1), `limit` (default 10, max 100)
- **Filtering**: `status`, `priority`, `category`, `search` (title/description), `startDate`, `endDate`
- **Sorting**: `sortBy` (default `createdAt`), `sortOrder` (default `desc`)
- **Stats**: Returns counts of pending/approved/rejected/completed tasks
- **Role-based**: Users see only their tasks; admins see all

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^5.2.1 | Web framework |
| mongoose | ^9.7.3 | MongoDB ODM |
| jsonwebtoken | ^9.0.3 | JWT signing/verification |
| bcryptjs | ^3.0.3 | Password hashing |
| bcrypt | ^6.0.0 | Password hashing (legacy, unused) |
| cookie-parser | ^1.4.7 | Cookie parsing middleware |
| cookies | ^0.9.1 | Cookie utilities |
| cors | ^2.8.6 | CORS middleware |
| dotenv | ^17.4.2 | Environment variable loading |
| http-status-codes | ^2.3.0 | HTTP status code constants |
| validator | ^13.15.35 | String validation (email, etc.) |
| nodemon | ^3.1.14 | Dev auto-restart (unused in scripts) |

## Current Status

### Implemented
- Server startup with MongoDB connection (cached for hot-reload)
- Express app with CORS, JSON parsing, cookie parsing
- User registration, login, logout
- JWT auth with HTTP-Only cookies
- User profile retrieval
- Task CRUD with pagination, filtering, sorting, stats
- Role-based authorization middleware

### Planned / Not Yet Implemented
- Email service (Nodemailer)
- Password reset flow (forgot/reset with tokens)
- Email verification
- Notification system (model exists, no controller/routes)
- Admin dashboard endpoints
- Activity logging
- File uploads
- Rate limiting
- Request validation middleware
- Global error handler
- Tests
- Email templates
## License

ISC

## Author

**Rakesh Patel**
