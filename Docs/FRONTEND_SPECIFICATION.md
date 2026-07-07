# Frontend Specification

## 7.1 Page Structure

```
/
├── login
├── register
├── dashboard
│   ├── employee-dashboard
│   ├── manager-dashboard
│   └── admin-dashboard
├── tasks
│   ├── list
│   ├── create
│   ├── edit/:id
│   └── details/:id
├── notifications
├── profile
├── admin
│   ├── users
│   ├── analytics
│   └── logs
└── 404
```

---

## 7.2 Page Descriptions

### Login Page
- Email input with validation
- Password input with toggle visibility
- "Forgot Password" link
- "Sign Up" link for new users
- Error messages for invalid credentials
- Loading state during authentication

### Register Page
- Full name input
- Email input with real-time validation
- Password with strength indicator
- Confirm password
- Role selection dropdown (Employee default)
- Terms acceptance checkbox
- "Already have an account?" link

### Dashboard

**Employee View:**
- Task statistics: Pending, Approved, Rejected, Completed
- Recent tasks list
- Quick create task button
- Pending approvals count

**Manager View:**
- Tasks pending review list
- Team statistics
- Quick action buttons for approval/rejection
- Employee activity feed

**Admin View:**
- Platform metrics cards
- User growth chart
- Task trends visualization
- System health indicators

### Task List
- Filter by status, priority, category
- Search bar for title/description
- Sort by date, priority, status
- Pagination controls
- Create new task button
- Task status badges (Pending, Approved, Rejected, Completed)

### Task Details
- Complete task information
- Timeline of actions
- Attachments preview
- Approval/Rejection buttons (Manager)
- Mark Complete button
- Edit/Delete buttons (Employee for pending tasks)
- Comments section
- Audit trail

### Create/Edit Task
- Form with all required fields
- Real-time validation
- Priority dropdown
- Date picker for deadline
- Category tags input
- File attachment upload
- Preview before submission
- Cancel button

### Notifications
- List of notifications
- Unread/Read status indicators
- Mark as read functionality
- Delete notification
- Click to navigate to related task

### Profile Page
- Avatar upload
- Personal information fields
- Email verification status
- Change password section
- Account settings
- Activity log

### Admin Pages

**User Management:**
- User table with search/filter
- Role assignment dropdown
- Suspend/Activate toggle
- User creation date
- Last login information

**Analytics:**
- Interactive charts (Chart.js)
- User growth metrics
- Task completion rates
- Manager performance metrics
- Export functionality

**Logs:**
- Activity logs table
- Search/filter by user, action, date
- Pagination
- Export to CSV

### 404 Page
- Custom illustration
- "Go Home" button
- Site navigation links
- Search functionality

---

## 7.3 UI Components

```jsx
// Core Components Structure
src/components/
├── common/
│   ├── Button/
│   │   ├── Button.jsx
│   │   ├── Button.module.css
│   │   └── index.js
│   ├── Input/
│   │   ├── Input.jsx
│   │   ├── Input.module.css
│   │   └── index.js
│   ├── Select/
│   │   ├── Select.jsx
│   │   ├── Select.module.css
│   │   └── index.js
│   ├── DatePicker/
│   │   ├── DatePicker.jsx
│   │   ├── DatePicker.module.css
│   │   └── index.js
│   ├── Modal/
│   │   ├── Modal.jsx
│   │   ├── Modal.module.css
│   │   └── index.js
│   ├── LoadingSpinner/
│   │   ├── LoadingSpinner.jsx
│   │   ├── LoadingSpinner.module.css
│   │   └── index.js
│   ├── ErrorBoundary/
│   │   ├── ErrorBoundary.jsx
│   │   └── index.js
│   └── Pagination/
│       ├── Pagination.jsx
│       ├── Pagination.module.css
│       └── index.js
├── layout/
│   ├── Header/
│   │   ├── Header.jsx
│   │   ├── Navigation.jsx
│   │   ├── UserMenu.jsx
│   │   ├── NotificationBell.jsx
│   │   ├── Header.module.css
│   │   └── index.js
│   ├── Sidebar/
│   │   ├── Sidebar.jsx
│   │   ├── Sidebar.module.css
│   │   └── index.js
│   ├── Footer/
│   │   ├── Footer.jsx
│   │   ├── Footer.module.css
│   │   └── index.js
│   └── MainLayout/
│       ├── MainLayout.jsx
│       ├── MainLayout.module.css
│       └── index.js
├── auth/
│   ├── LoginForm/
│   │   ├── LoginForm.jsx
│   │   ├── LoginForm.module.css
│   │   └── index.js
│   ├── RegisterForm/
│   │   ├── RegisterForm.jsx
│   │   ├── RegisterForm.module.css
│   │   └── index.js
│   ├── ForgotPassword/
│   │   ├── ForgotPassword.jsx
│   │   ├── ForgotPassword.module.css
│   │   └── index.js
│   └── ResetPassword/
│       ├── ResetPassword.jsx
│       ├── ResetPassword.module.css
│       └── index.js
├── tasks/
│   ├── TaskCard/
│   │   ├── TaskCard.jsx
│   │   ├── TaskCard.module.css
│   │   └── index.js
│   ├── TaskList/
│   │   ├── TaskList.jsx
│   │   ├── TaskList.module.css
│   │   └── index.js
│   ├── TaskForm/
│   │   ├── TaskForm.jsx
│   │   ├── TaskForm.module.css
│   │   └── index.js
│   ├── TaskFilters/
│   │   ├── TaskFilters.jsx
│   │   ├── TaskFilters.module.css
│   │   └── index.js
│   └── TaskStatusBadge/
│       ├── TaskStatusBadge.jsx
│       ├── TaskStatusBadge.module.css
│       └── index.js
├── notifications/
│   ├── NotificationList/
│   │   ├── NotificationList.jsx
│   │   ├── NotificationList.module.css
│   │   └── index.js
│   ├── NotificationItem/
│   │   ├── NotificationItem.jsx
│   │   ├── NotificationItem.module.css
│   │   └── index.js
│   └── NotificationDropdown/
│       ├── NotificationDropdown.jsx
│       ├── NotificationDropdown.module.css
│       └── index.js
├── admin/
│   ├── UserTable/
│   │   ├── UserTable.jsx
│   │   ├── UserTable.module.css
│   │   └── index.js
│   ├── AnalyticsChart/
│   │   ├── AnalyticsChart.jsx
│   │   ├── AnalyticsChart.module.css
│   │   └── index.js
│   └── LogTable/
│       ├── LogTable.jsx
│       ├── LogTable.module.css
│       └── index.js
└── profile/
    ├── ProfileForm/
    │   ├── ProfileForm.jsx
    │   ├── ProfileForm.module.css
    │   └── index.js
    ├── AvatarUpload/
    │   ├── AvatarUpload.jsx
    │   ├── AvatarUpload.module.css
    │   └── index.js
    └── ChangePassword/
        ├── ChangePassword.jsx
        ├── ChangePassword.module.css
        └── index.js
```

### Component Specifications

| Component | Props | Description |
|-----------|-------|-------------|
| **Button** | `variant`, `size`, `disabled`, `loading`, `onClick`, `children` | Reusable button with variants (primary, secondary, danger, success) |
| **Input** | `type`, `value`, `onChange`, `placeholder`, `error`, `label`, `required` | Form input with validation state |
| **Select** | `options`, `value`, `onChange`, `label`, `error` | Dropdown select component |
| **Modal** | `isOpen`, `onClose`, `title`, `children`, `size` | Overlay modal dialog |
| **TaskCard** | `task`, `onClick`, `onStatusChange`, `role` | Task preview card with status |
| **TaskFilters** | `filters`, `onFilterChange`, `onSearch` | Filter and search controls |
| **NotificationItem** | `notification`, `onMarkRead`, `onDelete` | Individual notification display |

---

## 7.4 State Management

### React Context Structure

```
context/
├── AuthContext/
│   ├── AuthProvider.jsx      # Authentication provider wrapper
│   ├── AuthReducer.js        # Auth state reducer
│   ├── authActions.js        # Auth action creators
│   └── index.js              # Exports context, provider, and hooks
├── TaskContext/
│   ├── TaskProvider.jsx      # Task management provider
│   ├── TaskReducer.js        # Task state reducer
│   ├── taskActions.js        # Task action creators
│   └── index.js              # Exports context, provider, and hooks
├── NotificationContext/
│   ├── NotificationProvider.jsx  # Notification provider
│   ├── NotificationReducer.js    # Notification state reducer
│   ├── notificationActions.js    # Notification action creators
│   └── index.js                  # Exports context, provider, and hooks
└── ThemeContext/
    ├── ThemeProvider.jsx     # Theme provider (dark/light)
    ├── ThemeReducer.js       # Theme state reducer
    └── index.js              # Exports context, provider, and hooks
```

### State Management Specifications

#### AuthContext

| Property | Type | Description |
|----------|------|-------------|
| `user` | Object | Current user data (null if not authenticated) |
| `token` | String | JWT access token |
| `isAuthenticated` | Boolean | Authentication status |
| `isLoading` | Boolean | Loading state for auth operations |
| `error` | String | Authentication error message |

**Actions:**
- `login(email, password)` - Authenticate user
- `register(userData)` - Register new user
- `logout()` - Logout user
- `refreshToken()` - Refresh access token
- `updateProfile(data)` - Update user profile
- `changePassword(data)` - Change user password

#### TaskContext

| Property | Type | Description |
|----------|------|-------------|
| `tasks` | Array | List of tasks |
| `selectedTask` | Object | Currently selected task |
| `filters` | Object | Active filters (status, priority, category) |
| `pagination` | Object | Pagination data (page, limit, total) |
| `stats` | Object | Task statistics |
| `isLoading` | Boolean | Loading state |
| `error` | String | Error message |

**Actions:**
- `fetchTasks(filters)` - Get tasks with filters
- `fetchTask(id)` - Get single task
- `createTask(data)` - Create new task
- `updateTask(id, data)` - Update task
- `deleteTask(id)` - Delete task
- `updateStatus(id, status)` - Update task status
- `clearFilters()` - Reset all filters

#### NotificationContext

| Property | Type | Description |
|----------|------|-------------|
| `notifications` | Array | User notifications |
| `unreadCount` | Number | Count of unread notifications |
| `isLoading` | Boolean | Loading state |
| `error` | String | Error message |

**Actions:**
- `fetchNotifications()` - Get user notifications
- `markAsRead(id)` - Mark notification as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification(id)` - Delete notification
- `fetchUnreadCount()` - Get unread count

### Custom Hooks

```javascript
// hooks/useAuth.js
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// hooks/useTasks.js
const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within TaskProvider');
  }
  return context;
};

// hooks/useNotifications.js
const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// hooks/useLocalStorage.js
const useLocalStorage = (key, initialValue) => {
  // Persist state in localStorage
  // Returns [storedValue, setValue]
};
```

### State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        STATE MANAGEMENT FLOW                   │
└─────────────────────────────────────────────────────────────────┘

                     ┌──────────────────┐
                     │   User Action    │
                     │  (Click/Input)   │
                     └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │   Component      │
                     │   Dispatches     │
                     │   Action         │
                     └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │   Context        │
                     │   Reducer        │
                     └────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
           ┌─────────────┐    ┌──────────────────┐
           │  API Call   │    │  Update State   │
           │  (Async)    │    │  (Sync)         │
           └──────┬──────┘    └────────┬─────────┘
                  │                    │
                  ▼                    ▼
         ┌─────────────┐    ┌──────────────────┐
         │  Response   │    │  Re-render       │
         │  Handled    │    │  Components      │
         └─────────────┘    └──────────────────┘
```

### Redux Alternative (Optional)

For larger applications, consider using Redux Toolkit:

```
store/
├── slices/
│   ├── authSlice.js        # Authentication slice
│   ├── taskSlice.js        # Task management slice
│   ├── notificationSlice.js # Notification slice
│   └── uiSlice.js          # UI state slice (theme, modals, etc.)
├── store.js                # Store configuration
└── rootReducer.js          # Root reducer
```