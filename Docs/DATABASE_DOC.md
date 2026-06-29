# Database Design

## 3.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ER DIAGRAM                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐          ┌──────────────────────┐
│        User          │          │        Task          │
├──────────────────────┤          ├──────────────────────┤
│ id                   │◄─────────│ createdBy            │
│ name                 │          │ approvedBy           │
│ email                │          │ title                │
│ password             │          │ description          │
│ role                 │          │ priority             │
│ avatar               │          │ deadline             │
│ isActive             │          │ category             │
│ isEmailVerified      │          │ status               │
│ refreshToken         │          │ attachmentUrl        │
│ lastLogin            │          │ rejectionReason      │
│ createdAt            │          │ isDeleted            │
│ updatedAt            │          │ createdAt            │
└──────────────────────┘          │ updatedAt            │
          │                       └──────────────────────┘
          │                                │
          │                                │
          ▼                                ▼
┌──────────────────────┐          ┌──────────────────────┐
│  Notification        │          │   ActivityLog        │
├──────────────────────┤          ├──────────────────────┤
│ id                   │          │ id                   │
│ userId───────────────┼──────────│ userId───────────────┼──────────┐
│ title                │          │ action               │          │
│ message              │          │ entityType           │          │
│ type                 │          │ entityId             │          │
│ isRead               │          │ changes              │          │
│ createdAt            │          │ ip                   │          │
└──────────────────────┘          │ userAgent            │          │
                                   │ timestamp            │          │
                                   └──────────────────────┘          │
                                                                     │
                                                                     │
┌──────────────────────┐          ┌──────────────────────┐          │
│PasswordResetToken    │          │EmailVerificationToken│          │
├──────────────────────┤          ├──────────────────────┤          │
│ id                   │          │ id                   │          │
│ userId───────────────┼──────────│ userId───────────────┼──────────┘
│ token                │          │ token                │
│ expiresAt            │          │ expiresAt            │
│ used                 │          │ verified             │
└──────────────────────┘          └──────────────────────┘

Relationships:
─────────────
User 1 ──► * Task (createdBy)
User 1 ──► * Task (approvedBy)
User 1 ──► * Notification (userId)
User 1 ──► * ActivityLog (userId)
User 1 ──► 1 PasswordResetToken (userId)
User 1 ──► 1 EmailVerificationToken (userId)
```

## 3.2 Collection Schemas

### User Collection

| Field | Type | Required | Default | Index | Description |
|-------|------|----------|---------|-------|-------------|
| name | String | Yes | - | - | Full name of user |
| email | String | Yes | - | Unique | User's email address |
| password | String | Yes | - | - | Hashed password |
| role | Enum | Yes | 'employee' | - | employee, manager, admin |
| avatar | String | No | null | - | Profile picture URL |
| isActive | Boolean | Yes | true | - | Account active status |
| isEmailVerified | Boolean | Yes | false | - | Email verification status |
| refreshToken | String | No | null | - | JWT refresh token |
| lastLogin | Date | No | null | - | Last login timestamp |
| createdAt | Date | Yes | Date.now | - | Account creation date |
| updatedAt | Date | Yes | Date.now | - | Last update timestamp |

**Sample Document:**
```json
{
  "_id": ObjectId("65d4f2a1b3c4d5e6f7g8h9i0"),
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2b$10$abcdefghijklmnopqrstuvwxyz1234567890",
  "role": "employee",
  "avatar": "https://storage.example.com/avatar.jpg",
  "isActive": true,
  "isEmailVerified": true,
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "lastLogin": ISODate("2024-03-15T09:00:00Z"),
  "createdAt": ISODate("2024-01-01T00:00:00Z"),
  "updatedAt": ISODate("2024-03-15T09:00:00Z")
}
```

---

### Task Collection

| Field | Type | Required | Default | Index | Description |
|-------|------|----------|---------|-------|-------------|
| title | String | Yes | - | Text | Task title |
| description | String | Yes | - | - | Detailed description |
| priority | Enum | Yes | 'medium' | - | low, medium, high |
| deadline | Date | No | null | - | Task deadline |
| category | String | No | null | - | Task category/label |
| status | Enum | Yes | 'pending' | - | pending, approved, rejected, completed |
| attachmentUrl | String | No | null | - | Optional file URL |
| createdBy | ObjectId | Yes | - | - | Reference to User |
| approvedBy | ObjectId | No | null | - | Reference to Manager |
| rejectionReason | String | No | null | - | Reason for rejection |
| isDeleted | Boolean | Yes | false | - | Soft delete flag |
| createdAt | Date | Yes | Date.now | - | Creation timestamp |
| updatedAt | Date | Yes | Date.now | - | Last update timestamp |

**Sample Document:**
```json
{
  "_id": ObjectId("65d4f2a1b3c4d5e6f7g8h9i1"),
  "title": "Design System Update",
  "description": "Update the component library with new design tokens",
  "priority": "high",
  "deadline": ISODate("2024-04-01T00:00:00Z"),
  "category": "Design",
  "status": "pending",
  "attachmentUrl": "https://storage.example.com/design-spec.pdf",
  "createdBy": ObjectId("65d4f2a1b3c4d5e6f7g8h9i0"),
  "approvedBy": null,
  "rejectionReason": null,
  "isDeleted": false,
  "createdAt": ISODate("2024-03-15T10:30:00Z"),
  "updatedAt": ISODate("2024-03-15T10:30:00Z")
}
```

---

### Notification Collection

| Field | Type | Required | Default | Index | Description |
|-------|------|----------|---------|-------|-------------|
| userId | ObjectId | Yes | - | - | Recipient user |
| title | String | Yes | - | - | Notification title |
| message | String | Yes | - | - | Notification content |
| type | Enum | Yes | - | - | task_created, task_approved, task_rejected, task_completed, welcome, password_reset |
| isRead | Boolean | Yes | false | - | Read status |
| createdAt | Date | Yes | Date.now | - | Creation timestamp |

**Sample Document:**
```json
{
  "_id": ObjectId("65d4f2a1b3c4d5e6f7g8h9i2"),
  "userId": ObjectId("65d4f2a1b3c4d5e6f7g8h9i0"),
  "title": "Task Approved",
  "message": "Your task 'Design System Update' has been approved",
  "type": "task_approved",
  "isRead": false,
  "createdAt": ISODate("2024-03-15T10:30:00Z")
}
```

---

### ActivityLog Collection

| Field | Type | Required | Default | Index | Description |
|-------|------|----------|---------|-------|-------------|
| userId | ObjectId | Yes | - | - | User performing action |
| action | String | Yes | - | - | Action performed |
| entityType | String | Yes | - | - | Type of entity affected |
| entityId | String | Yes | - | - | Entity identifier |
| changes | Object | No | {} | - | Changes made |
| ip | String | No | null | - | User's IP address |
| userAgent | String | No | null | - | User's browser info |
| timestamp | Date | Yes | Date.now | - | Action timestamp |

**Sample Document:**
```json
{
  "_id": ObjectId("65d4f2a1b3c4d5e6f7g8h9i3"),
  "userId": ObjectId("65d4f2a1b3c4d5e6f7g8h9i0"),
  "action": "TASK_CREATE",
  "entityType": "Task",
  "entityId": "65d4f2a1b3c4d5e6f7g8h9i1",
  "changes": {
    "title": "Design System Update",
    "priority": "high"
  },
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "timestamp": ISODate("2024-03-15T10:30:00Z")
}
```

---

### PasswordResetToken Collection

| Field | Type | Required | Default | Index | Description |
|-------|------|----------|---------|-------|-------------|
| userId | ObjectId | Yes | - | - | User reference |
| token | String | Yes | - | Unique | Reset token |
| expiresAt | Date | Yes | - | TTL | Expiration time |
| used | Boolean | Yes | false | - | Token usage flag |

**Sample Document:**
```json
{
  "_id": ObjectId("65d4f2a1b3c4d5e6f7g8h9i4"),
  "userId": ObjectId("65d4f2a1b3c4d5e6f7g8h9i0"),
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "expiresAt": ISODate("2024-03-15T11:30:00Z"),
  "used": false
}
```

---

### EmailVerificationToken Collection

| Field | Type | Required | Default | Index | Description |
|-------|------|----------|---------|-------|-------------|
| userId | ObjectId | Yes | - | - | User reference |
| token | String | Yes | - | Unique | Verification token |
| expiresAt | Date | Yes | - | TTL | Expiration time |
| verified | Boolean | Yes | false | - | Verification status |

**Sample Document:**
```json
{
  "_id": ObjectId("65d4f2a1b3c4d5e6f7g8h9i5"),
  "userId": ObjectId("65d4f2a1b3c4d5e6f7g8h9i0"),
  "token": "550e8400-e29b-41d4-a716-446655440001",
  "expiresAt": ISODate("2024-03-15T11:30:00Z"),
  "verified": false
}
```

---

## Indexing Strategy

### Recommended Indexes for Performance

**User Collection:**
```javascript
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })
db.users.createIndex({ "isActive": 1 })
db.users.createIndex({ "createdAt": -1 })
```

**Task Collection:**
```javascript
db.tasks.createIndex({ "createdBy": 1 })
db.tasks.createIndex({ "status": 1 })
db.tasks.createIndex({ "priority": 1 })
db.tasks.createIndex({ "deadline": 1 })
db.tasks.createIndex({ "createdAt": -1 })
db.tasks.createIndex({ "title": "text", "description": "text" })
db.tasks.createIndex({ "isDeleted": 1 })
```

**Notification Collection:**
```javascript
db.notifications.createIndex({ "userId": 1 })
db.notifications.createIndex({ "isRead": 1 })
db.notifications.createIndex({ "createdAt": -1 })
db.notifications.createIndex({ "userId": 1, "isRead": 1 })
```

**ActivityLog Collection:**
```javascript
db.activitylogs.createIndex({ "userId": 1 })
db.activitylogs.createIndex({ "timestamp": -1 })
db.activitylogs.createIndex({ "entityType": 1 })
db.activitylogs.createIndex({ "action": 1 })
db.activitylogs.createIndex({ "timestamp": -1, "userId": 1 })
```

**PasswordResetToken Collection:**
```javascript
db.passwordresettokens.createIndex({ "token": 1 }, { unique: true })
db.passwordresettokens.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
```

**EmailVerificationToken Collection:**
```javascript
db.emailverificationtokens.createIndex({ "token": 1 }, { unique: true })
db.emailverificationtokens.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
```

## Data Relationships Summary

| Relationship | Type | Description |
|--------------|------|-------------|
| User → Task (createdBy) | One-to-Many | A user can create many tasks |
| User → Task (approvedBy) | One-to-Many | A manager can approve many tasks |
| User → Notification | One-to-Many | A user can have many notifications |
| User → ActivityLog | One-to-Many | A user can have many activity logs |
| User → PasswordResetToken | One-to-One | A user can have one active reset token |
| User → EmailVerificationToken | One-to-One | A user can have one active verification token |

## Data Validation Rules

### User Validation
- **name:** Min 2, Max 50 characters
- **email:** Valid email format, unique
- **password:** Min 8, Max 30, at least 1 uppercase, 1 lowercase, 1 number, 1 special character
- **role:** Enum ['employee', 'manager', 'admin']

### Task Validation
- **title:** Min 3, Max 100 characters
- **description:** Max 1000 characters
- **priority:** Enum ['low', 'medium', 'high']
- **status:** Enum ['pending', 'approved', 'rejected', 'completed']
- **deadline:** Must be future date (if provided)

### Notification Validation
- **type:** Enum ['task_created', 'task_approved', 'task_rejected', 'task_completed', 'welcome', 'password_reset']
```