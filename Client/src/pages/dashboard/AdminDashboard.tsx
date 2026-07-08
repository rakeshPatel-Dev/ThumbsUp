import { Link } from 'react-router-dom';
import { useGetDashboardStatsQuery } from '@/store/api/adminApi';
import { useGetUsersQuery } from '@/store/api/userApi';
import { useGetTasksQuery } from '@/store/api/taskApi';
import { StatusBadge } from '@/components/common/StatusBadge';
import { buttonVariants } from '@/components/ui/button';
import {
  Users, ClipboardList, CheckCircle2, Clock, AlertCircle,
  TrendingUp, ArrowRight, Kanban, ScrollText, BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: string;
}

function MetricCard({ label, value, icon, iconBg, iconColor, trend }: StatCard) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center', iconBg)}>
          <span className={iconColor}>{icon}</span>
        </div>
        {trend && (
          <span className="text-xs font-mono text-success flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" /> {trend}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function QuickLink({
  to, icon, label, description, color,
}: {
  to: string; icon: React.ReactNode; label: string; description: string; color: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:shadow-sm transition-all group"
    >
      <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0', color)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
    </Link>
  );
}

export function AdminDashboard() {
  const { data: statsData, isLoading: statsLoading } = useGetDashboardStatsQuery({});
  const { data: usersData } = useGetUsersQuery({});
  const { data: tasksData } = useGetTasksQuery({});

  const stats = statsData?.data ?? {};
  const recentUsers = (usersData?.data?.users ?? []).slice(0, 5);
  const recentTasks = (tasksData?.data?.tasks ?? []).slice(0, 5);

  const totalUsers = stats.totalUsers ?? usersData?.data?.users?.length ?? 0;
  const totalTasks = stats.totalTasks ?? tasksData?.data?.tasks?.length ?? 0;
  const pendingTasks = stats.pendingTasks ?? (tasksData?.data?.tasks ?? []).filter((t: { status: string }) => t.status === 'pending').length;
  const completedTasks = stats.completedTasks ?? (tasksData?.data?.tasks ?? []).filter((t: { status: string }) => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Platform-wide metrics and system overview.
        </p>
      </div>

      {/* Metric cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Users"
            value={totalUsers}
            icon={<Users className="h-5 w-5" />}
            iconBg="bg-primary/10"
            iconColor="text-primary"
          />
          <MetricCard
            label="Total Tasks"
            value={totalTasks}
            icon={<ClipboardList className="h-5 w-5" />}
            iconBg="bg-chart-2/10"
            iconColor="text-chart-2"
          />
          <MetricCard
            label="Pending Review"
            value={pendingTasks}
            icon={<Clock className="h-5 w-5" />}
            iconBg="bg-warning/10"
            iconColor="text-warning"
          />
          <MetricCard
            label="Completion Rate"
            value={`${completionRate}%`}
            icon={<CheckCircle2 className="h-5 w-5" />}
            iconBg="bg-success/10"
            iconColor="text-success"
          />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Recent tasks + users */}
        <div className="lg:col-span-2 space-y-5">
          {/* System Health */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="font-heading font-semibold text-foreground mb-4">System Health</h2>
            <div className="space-y-3">
              {[
                { label: 'API Response', status: 'Operational', ok: true },
                { label: 'Database', status: 'Operational', ok: true },
                { label: 'Auth Service', status: 'Operational', ok: true },
                { label: 'Notification Service', status: 'Operational', ok: true },
              ].map(({ label, status, ok }) => (
                <div key={label} className="flex items-center justify-between py-1">
                  <span className="text-sm text-foreground">{label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={cn('h-2 w-2 rounded-full', ok ? 'bg-success' : 'bg-destructive')} />
                    <span className={cn('text-xs font-mono', ok ? 'text-success' : 'text-destructive')}>
                      {status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-heading font-semibold text-foreground">Recent Tasks</h2>
              <Link to="/tasks" className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' text-primary hover:text-primary/80'}>View all <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
            </div>
            <div className="divide-y divide-border">
              {recentTasks.length === 0 ? (
                <p className="px-5 py-6 text-center text-sm text-muted-foreground">No tasks yet</p>
              ) : (
                recentTasks.map((t: { id: string; title: string; status: string; createdBy?: { name: string } }) => (
                  <div key={t.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.title}</p>
                      {t.createdBy && (
                        <p className="text-xs font-mono text-muted-foreground">by {t.createdBy.name}</p>
                      )}
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-heading font-semibold text-foreground">Recent Users</h2>
              <Link to="/admin/users" className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' text-primary hover:text-primary/80'}>View all <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
            </div>
            <div className="divide-y divide-border">
              {recentUsers.length === 0 ? (
                <p className="px-5 py-6 text-center text-sm text-muted-foreground">No users yet</p>
              ) : (
                recentUsers.map((u: { id: string; name: string; email: string; role: string; isActive: boolean }) => (
                  <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-mono text-muted-foreground capitalize">{u.role}</span>
                      <span className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        u.isActive ? 'bg-success' : 'bg-destructive'
                      )} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h2 className="font-heading font-semibold text-foreground px-1">Admin Tools</h2>
          <QuickLink
            to="/admin/users"
            icon={<Users className="h-5 w-5 text-chart-2" />}
            label="Manage Users"
            description="Roles, access & accounts"
            color="bg-chart-2/10"
          />
          <QuickLink
            to="/admin/analytics"
            icon={<BarChart3 className="h-5 w-5 text-success" />}
            label="Analytics"
            description="Charts & growth metrics"
            color="bg-success/10"
          />
          <QuickLink
            to="/admin/logs"
            icon={<ScrollText className="h-5 w-5 text-warning" />}
            label="System Logs"
            description="Activity audit trail"
            color="bg-warning/10"
          />

        </div>
      </div>
    </div>
  );
}
