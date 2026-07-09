import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Dashboards
import { DashboardRouter } from '@/pages/dashboard/DashboardRouter';

// Task Pages
import { TaskListPage } from '@/pages/tasks/TaskListPage';
import { TaskDetailsPage } from '@/pages/tasks/TaskDetailsPage';
import { TaskFormPage } from '@/pages/tasks/TaskFormPage';

// Common Pages
import { NotificationsPage } from '@/pages/NotificationsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Admin Pages

import { UsersPage } from '@/pages/admin/UsersPage';
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';
import { LogsPage } from '@/pages/admin/LogsPage';

function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes (Authenticated users only) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Default redirect from root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Role-based Smart Dashboard Router */}
          <Route path="/dashboard" element={<DashboardRouter />} />

          {/* Tasks Management */}
          <Route path="/tasks" element={<TaskListPage />} />
          <Route path="/tasks/create" element={<TaskFormPage />} />
          <Route path="/tasks/:id" element={<TaskDetailsPage />} />
          <Route path="/tasks/:id/edit" element={<TaskFormPage />} />

          {/* User Profile & Notifications */}
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin Specific Routes (Admin role only) */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>

            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/analytics" element={<AnalyticsPage />} />
            <Route path="/admin/logs" element={<LogsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback Catch-all / 404 */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;
