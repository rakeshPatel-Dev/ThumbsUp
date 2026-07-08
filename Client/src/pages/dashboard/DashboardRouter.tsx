import { useSelector } from 'react-redux';
import { selectAuth } from '@/store/store';
import { EmployeeDashboard } from './EmployeeDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { AdminDashboard } from './AdminDashboard';

export function DashboardRouter() {
  const { user } = useSelector(selectAuth);
  const role = user?.role;

  if (role === 'admin') return <AdminDashboard />;
  if (role === 'manager') return <ManagerDashboard />;
  return <EmployeeDashboard />;
}
