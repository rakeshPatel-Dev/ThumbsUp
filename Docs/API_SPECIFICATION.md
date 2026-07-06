# API SPECIFICATION

## Base Configuration

- **Base URL:** `https://api.thumbsup.com/v1`
- **Response Format:** JSON
- **Authentication:** JWT Bearer Token (HTTP-Only Cookie)
- **Rate Limiting:** 100 requests per minute per IP

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {},
  "timestamp": "2024-03-15T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ],
  "timestamp": "2024-03-15T10:30:00Z"
}
```

## Authentication Endpoints

### POST /api/auth/register
**Purpose:** Register a new user account  
**Authentication:** Not required

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "employee"
}
```

**Validation Rules:**

| Field | Rules |
|-------|-------|
| name | Required, min 2, max 50 characters |
| email | Required, valid email format, unique |
| password | Required, min 8, max 30, at least 1 uppercase, 1 lowercase, 1 number, 1 special character |
| role | Optional, enum: employee, manager, admin |

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "user": {
      "id": "65d4f2a1b3c4d5e6f7g8h9i0",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "employee"
    }
  }
}
```

**Error Responses:**
- **400:** Validation error
- **409:** Email already exists
- **500:** Server error

---

### POST /api/auth/login
**Purpose:** Authenticate user  
**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65d4f2a1b3c4d5e6f7g8h9i0",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "employee",
      "isEmailVerified": true
    }
  }
}

```

Sets HTTP-Only cookie with JWT token

**Error Responses:**
- **400:** Missing credentials
- **401:** Invalid credentials
- **403:** Account suspended
- **403:** Email not verified

---

### POST /api/auth/logout
**Purpose:** Logout user  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully"
}
```
Clears HTTP-Only cookie

---

### POST /api/auth/refresh-token
**Purpose:** Get new access token  
**Authentication:** Required (refresh token)

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### POST /api/auth/forgot-password
**Purpose:** Request password reset  
**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset email sent"
}
```

---

### POST /api/auth/reset-password
**Purpose:** Reset password using token  
**Authentication:** Not required

**Request Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "NewSecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successful"
}
```

---

### POST /api/auth/verify-email
**Purpose:** Verify user email  
**Authentication:** Not required

**Request Body:**
```json
{
  "token": "verification_token_here"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Email verified successfully"
}
```

---

### POST /api/auth/change-password
**Purpose:** Change user password  
**Authentication:** Required

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password changed successfully"
}
```

## User Endpoints

### GET /api/users/profile
**Purpose:** Get current user profile  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "user": {
      "id": "65d4f2a1b3c4d5e6f7g8h9i0",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "employee",
      "avatar": "https://storage.example.com/avatar.jpg",
      "isEmailVerified": true,
      "lastLogin": "2024-03-15T09:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

### PUT /api/users/profile
**Purpose:** Update user profile  
**Authentication:** Required

**Request Body:**
```json
{
  "name": "Johnathan Doe",
  "avatar": "https://storage.example.com/new-avatar.jpg"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "65d4f2a1b3c4d5e6f7g8h9i0",
      "name": "Johnathan Doe",
      "email": "john@example.com"
    }
  }
}
```

---

### GET /api/users
**Purpose:** Get all users (Admin only)  
**Authentication:** Required (Admin role)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term for name/email
- `role`: Filter by role
- `isActive`: Filter by active status
- `sortBy`: Sort field
- `sortOrder`: asc/desc

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "users": [...],
    "pagination": {
      "total": 50,
      "page": 1,
      "pages": 5,
      "limit": 10
    }
  }
}
```

---

### PUT /api/users/:userId/role
**Purpose:** Update user role (Admin only)  
**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "role": "manager"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User role updated successfully"
}
```

---

### PUT /api/users/:userId/suspend
**Purpose:** Suspend/Unsuspend user (Admin only)  
**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "action": "suspend"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User suspended successfully"
}
```

## Task Endpoints

### POST /api/tasks
**Purpose:** Create a new task  
**Authentication:** Required

**Request Body:**
```json
{
  "title": "Design System Update",
  "description": "Update the component library with new design tokens",
  "priority": "high",
  "deadline": "2024-04-01",
  "category": "Design",
  "attachmentUrl": "https://storage.example.com/design-spec.pdf"
}
```

**Validation Rules:**

| Field | Rules |
|-------|-------|
| title | Required, min 3, max 100 characters |
| description | Required, max 1000 characters |
| priority | Required, enum: low, medium, high |
| deadline | Optional, must be future date |
| category | Optional, max 50 characters |
| attachmentUrl | Optional, valid URL format |

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Task created successfully",
  "data": {
    "task": {
      "id": "65d4f2a1b3c4d5e6f7g8h9i1",
      "title": "Design System Update",
      "description": "Update the component library with new design tokens",
      "priority": "high",
      "status": "pending",
      "deadline": "2024-04-01T00:00:00Z",
      "category": "Design",
      "createdBy": {
        "id": "65d4f2a1b3c4d5e6f7g8h9i0",
        "name": "John Doe"
      },
      "createdAt": "2024-03-15T10:30:00Z"
    }
  }
}
```

---

### GET /api/tasks
**Purpose:** Get all tasks (filtered by role)  
**Authentication:** Required

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status
- `priority`: Filter by priority
- `category`: Filter by category
- `search`: Search in title/description
- `startDate`: Filter by creation date range
- `endDate`: Filter by creation date range
- `sortBy`: Sort field
- `sortOrder`: asc/desc

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "tasks": [...],
    "pagination": {
      "total": 25,
      "page": 1,
      "pages": 3,
      "limit": 10
    },
    "stats": {
      "total": 25,
      "pending": 5,
      "approved": 10,
      "rejected": 3,
      "completed": 7
    }
  }
}
```

---

### GET /api/tasks/:taskId
**Purpose:** Get task details  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "task": {
      "id": "65d4f2a1b3c4d5e6f7g8h9i1",
      "title": "Design System Update",
      "description": "Update the component library with new design tokens",
      "priority": "high",
      "status": "pending",
      "deadline": "2024-04-01T00:00:00Z",
      "category": "Design",
      "attachmentUrl": "https://storage.example.com/design-spec.pdf",
      "createdBy": {
        "id": "65d4f2a1b3c4d5e6f7g8h9i0",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "approvedBy": null,
      "rejectionReason": null,
      "createdAt": "2024-03-15T10:30:00Z",
      "updatedAt": "2024-03-15T10:30:00Z"
    }
  }
}
```

---

### PUT /api/tasks/:taskId
**Purpose:** Update task (Employee: pending only; Manager: status updates)  
**Authentication:** Required

**Request Body (Employee):**
```json
{
  "title": "Updated Design System",
  "description": "Updated description",
  "priority": "medium",
  "deadline": "2024-04-15",
  "category": "Design"
}
```

**Request Body (Manager - Status Update):**
```json
{
  "status": "approved"
}
```
or
```json
{
  "status": "rejected",
  "rejectionReason": "Insufficient detail provided"
}
```
or
```json
{
  "status": "completed"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Task updated successfully",
  "data": {
    "task": { ... }
  }
}
```

---

### DELETE /api/tasks/:taskId
**Purpose:** Delete task (Employee: soft delete)  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Task deleted successfully"
}
```

## Notification Endpoints

### GET /api/notifications
**Purpose:** Get user notifications  
**Authentication:** Required

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `isRead`: Filter by read status
- `type`: Filter by notification type

**Success Response (200):**
```json
{x  
  "success": true,
  "statusCode": 200,
  "data": {
    "notifications": [
      {
        "id": "65d4f2a1b3c4d5e6f7g8h9i2",
        "title": "Task Approved",
        "message": "Your task 'Design System Update' has been approved",
        "type": "task_approved",
        "isRead": false,
        "createdAt": "2024-03-15T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "pages": 2,
      "limit": 20
    },
    "unreadCount": 5
  }
}
```

---

### PUT /api/notifications/:notificationId/read
**Purpose:** Mark notification as read  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notification marked as read"
}
```

---

### PUT /api/notifications/read-all
**Purpose:** Mark all notifications as read  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "All notifications marked as read"
}
```

---

### DELETE /api/notifications/:notificationId
**Purpose:** Delete notification  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notification deleted"
}
```

## Admin Endpoints

### GET /api/admin/dashboard
**Purpose:** Get admin dashboard analytics  
**Authentication:** Required (Admin role)

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "stats": {
      "totalUsers": 150,
      "activeUsers": 120,
      "totalTasks": 350,
      "pendingTasks": 45,
      "completedTasks": 200,
      "rejectedTasks": 30,
      "approvedTasks": 75
    },
    "recentActivity": [
      {
        "user": "John Doe",
        "action": "Created task",
        "timestamp": "2024-03-15T10:30:00Z"
      }
    ],
    "taskTrends": {
      "labels": ["Jan", "Feb", "Mar"],
      "created": [20, 35, 45],
      "completed": [15, 25, 30]
    },
    "userGrowth": {
      "labels": ["Jan", "Feb", "Mar"],
      "newUsers": [10, 15, 20]
    }
  }
}
```

---

### GET /api/admin/logs
**Purpose:** Get system logs  
**Authentication:** Required (Admin role)

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `userId`: Filter by user
- `action`: Filter by action
- `entityType`: Filter by entity type
- `startDate`: Filter by date range
- `endDate`: Filter by date range

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "logs": [
      {
        "user": {
          "id": "65d4f2a1b3c4d5e6f7g8h9i0",
          "name": "John Doe"
        },
        "action": "TASK_CREATE",
        "entityType": "Task",
        "entityId": "65d4f2a1b3c4d5e6f7g8h9i1",
        "changes": {
          "title": "Design System Update"
        },
        "ip": "192.168.1.1",
        "userAgent": "Mozilla/5.0 ...",
        "timestamp": "2024-03-15T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 1000,
      "page": 1,
      "pages": 50,
      "limit": 20
    }
  }
}
```

## Error Codes Summary

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 200 | Success | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input/validation error |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate email) |
| 422 | Unprocessable Entity | Business rule violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |
```