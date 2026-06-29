# Project Structure

## 8.1 Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database connection configuration
│   │   ├── email.js             # Email service configuration (Nodemailer)
│   │   ├── jwt.js               # JWT configuration and secret management
│   │   └── constants.js         # Application-wide constants
│   ├── models/
│   │   ├── User.js              # User schema and model
│   │   ├── Task.js              # Task schema and model
│   │   ├── Notification.js      # Notification schema and model
│   │   ├── ActivityLog.js       # Activity log schema and model
│   │   ├── PasswordResetToken.js # Password reset token schema
│   │   └── EmailVerificationToken.js # Email verification token schema
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic (login, register, etc.)
│   │   ├── userController.js    # User management logic
│   │   ├── taskController.js    # Task CRUD operations
│   │   ├── notificationController.js # Notification management
│   │   └── adminController.js   # Admin dashboard and analytics
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication endpoints
│   │   ├── userRoutes.js        # User management endpoints
│   │   ├── taskRoutes.js        # Task management endpoints
│   │   ├── notificationRoutes.js # Notification endpoints
│   │   └── adminRoutes.js       # Admin-only endpoints
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   ├── validation.js        # Request validation middleware
│   │   ├── errorHandler.js      # Global error handling middleware
│   │   ├── rateLimiter.js       # Rate limiting middleware
│   │   └── upload.js            # File upload middleware (multer)
│   ├── services/
│   │   ├── emailService.js      # Email sending service
│   │   ├── notificationService.js # Notification creation and delivery
│   │   ├── tokenService.js      # Token generation and validation
│   │   └── logger.js            # Logging service (Winston)
│   ├── validators/
│   │   ├── authValidator.js     # Auth request validation schemas
│   │   ├── userValidator.js     # User request validation schemas
│   │   ├── taskValidator.js     # Task request validation schemas
│   │   └── adminValidator.js    # Admin request validation schemas
│   ├── utils/
│   │   ├── helpers.js           # Utility helper functions
│   │   ├── apiResponse.js       # Standardized API response formatter
│   │   ├── constants.js         # Application constants
│   │   └── logger.js            # Logger utility
│   ├── templates/
│   │   └── email/
│   │       ├── welcome.html           # Welcome email template
│   │       ├── verifyEmail.html       # Email verification template
│   │       ├── taskCreated.html       # Task creation notification
│   │       ├── taskApproved.html      # Task approval notification
│   │       ├── taskRejected.html      # Task rejection notification
│   │       ├── taskCompleted.html     # Task completion notification
│   │       └── passwordReset.html     # Password reset email template
│   └── app.js                  # Express application entry point
├── tests/
│   ├── unit/                   # Unit tests
│   ├── integration/             # Integration tests
│   └── fixtures/               # Test fixtures and mock data
├── .env                        # Environment variables
├── .env.example                # Example environment variables
├── .gitignore                  # Git ignore file
├── package.json                # NPM dependencies and scripts
├── package-lock.json           # Locked dependency versions
├── jest.config.js              # Jest testing configuration
├── prettier.config.js          # Prettier code formatting config
└── README.md                   # Project documentation
```

### Backend File Descriptions

| File/Directory | Purpose |
|----------------|---------|
| `src/config/` | Configuration files for database, email, JWT, and constants |
| `src/models/` | Mongoose schema definitions for all collections |
| `src/controllers/` | Business logic and request handlers for each domain |
| `src/routes/` | API route definitions and endpoint mappings |
| `src/middleware/` | Custom middleware for authentication, validation, error handling |
| `src/services/` | Business services for email, notifications, tokens, logging |
| `src/validators/` | Request validation schemas using Joi or similar libraries |
| `src/utils/` | Utility functions, helpers, and API response formatters |
| `src/templates/` | HTML email templates for various notifications |
| `tests/` | Unit and integration tests |

---

## 8.2 Frontend Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── axiosInstance.js    # Axios instance with interceptors
│   │   ├── auth.js             # Authentication API calls
│   │   ├── tasks.js            # Task API calls
│   │   ├── notifications.js    # Notification API calls
│   │   └── admin.js            # Admin API calls
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx          # Reusable button component
│   │   │   ├── Input.jsx           # Reusable input component
│   │   │   ├── Modal.jsx           # Reusable modal component
│   │   │   ├── Spinner.jsx         # Loading spinner
│   │   │   ├── Toast.jsx           # Toast notification component
│   │   │   ├── Pagination.jsx      # Pagination component
│   │   │   └── SearchBar.jsx       # Search bar component
│   │   ├── layout/
│   │   │   ├── Header.jsx          # Application header
│   │   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   │   ├── Footer.jsx          # Application footer
│   │   │   └── Layout.jsx          # Main layout wrapper
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx       # Login form component
│   │   │   ├── RegisterForm.jsx    # Registration form
│   │   │   ├── ForgotPassword.jsx  # Forgot password form
│   │   │   └── ResetPassword.jsx   # Password reset form
│   │   ├── tasks/
│   │   │   ├── TaskCard.jsx        # Task display card
│   │   │   ├── TaskList.jsx        # Task listing component
│   │   │   ├── TaskForm.jsx        # Create/Edit task form
│   │   │   ├── TaskFilters.jsx     # Filter and search component
│   │   │   ├── TaskStats.jsx       # Task statistics display
│   │   │   └── StatusBadge.jsx     # Status badge component
│   │   ├── notifications/
│   │   │   ├── NotificationList.jsx # Notification listing
│   │   │   ├── NotificationItem.jsx # Individual notification
│   │   │   └── NotificationBadge.jsx # Unread count badge
│   │   ├── admin/
│   │   │   ├── UserTable.jsx       # User management table
│   │   │   ├── AnalyticsChart.jsx  # Chart components for analytics
│   │   │   ├── ActivityLogs.jsx    # Activity log viewer
│   │   │   └── DashboardStats.jsx  # Dashboard statistics cards
│   │   └── profile/
│   │       ├── ProfileInfo.jsx     # User profile display
│   │       ├── ProfileForm.jsx     # Profile edit form
│   │       └── ChangePassword.jsx  # Password change form
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   ├── Register.jsx        # Registration page
│   │   ├── Dashboard.jsx       # User dashboard
│   │   ├── TaskList.jsx        # Task listing page
│   │   ├── TaskDetails.jsx     # Single task view
│   │   ├── CreateTask.jsx      # Create new task page
│   │   ├── EditTask.jsx        # Edit task page
│   │   ├── Notifications.jsx   # Notifications page
│   │   ├── Profile.jsx         # User profile page
│   │   ├── Admin/
│   │   │   ├── Users.jsx       # User management page
│   │   │   ├── Analytics.jsx   # Analytics dashboard
│   │   │   └── Logs.jsx        # System logs viewer
│   │   └── NotFound.jsx        # 404 Not Found page
│   ├── context/
│   │   ├── AuthContext.jsx     # Authentication context provider
│   │   ├── TaskContext.jsx     # Task management context
│   │   └── NotificationContext.jsx # Notification context
│   ├── hooks/
│   │   ├── useAuth.js          # Authentication hook
│   │   ├── useTasks.js         # Task operations hook
│   │   ├── useNotifications.js # Notification operations hook
│   │   └── useLocalStorage.js  # Local storage persistence hook
│   ├── utils/
│   │   ├── validators.js       # Form validation utilities
│   │   ├── formatters.js       # Date, currency, etc. formatters
│   │   ├── constants.js        # Application constants
│   │   └── helpers.js          # General helper functions
│   ├── styles/
│   │   ├── globals.css         # Global CSS styles
│   │   └── themes.js           # Theme configuration (dark/light)
│   ├── routes/
│   │   ├── PrivateRoute.jsx    # Protected route wrapper
│   │   ├── AdminRoute.jsx      # Admin-only route wrapper
│   │   └── index.jsx           # Route configuration
│   ├── App.jsx                 # Main application component
│   └── main.jsx                # Application entry point
├── public/
│   ├── index.html              # HTML template
│   └── favicon.ico             # Favicon icon
├── .env                        # Environment variables
├── .env.example                # Example environment variables
├── .gitignore                  # Git ignore file
├── package.json                # NPM dependencies and scripts
├── package-lock.json           # Locked dependency versions
├── vite.config.js              # Vite build configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── eslint.config.js            # ESLint configuration
└── README.md                   # Project documentation
```

### Frontend File Descriptions

| File/Directory | Purpose |
|----------------|---------|
| `src/api/` | API service layer with axios and endpoint functions |
| `src/components/` | Reusable React components organized by feature |
| `src/pages/` | Page-level components for routing |
| `src/context/` | React context providers for state management |
| `src/hooks/` | Custom React hooks for reusable logic |
| `src/utils/` | Utility functions and helpers |
| `src/styles/` | Global styles and theme configuration |
| `src/routes/` | Route definitions and protected route wrappers |
| `public/` | Static assets |

---

## Key Dependencies

### Backend Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT authentication |
| `bcryptjs` | Password hashing |
| `nodemailer` | Email sending |
| `joi` | Request validation |
| `winston` | Logging |
| `multer` | File upload |
| `cors` | CORS middleware |
| `helmet` | Security headers |
| `express-rate-limit` | Rate limiting |
| `dotenv` | Environment variables |

### Frontend Dependencies

| Package | Purpose |
|---------|---------|
| `react` | UI library |
| `react-router-dom` | Routing |
| `axios` | HTTP client |
| `tailwindcss` | CSS framework |
| `react-hook-form` | Form handling |
| `yup` | Form validation |
| `react-query` | Data fetching and caching |
| `react-hot-toast` | Toast notifications |
| `recharts` | Charts and graphs |
| `date-fns` | Date formatting |
| `vite` | Build tool |