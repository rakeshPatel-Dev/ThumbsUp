import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectAuth } from '@/store/store';
import { useGetTasksQuery } from '@/store/api/taskApi';
import { useGetNotificationsQuery } from '@/store/api/notificationApi';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { buttonVariants } from '@/components/ui/button';
import {
  CheckCircle2, Clock, ThumbsDown, ListTodo, Plus, ArrowRight,
  Bell, TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskItem {
  _id: string;
  title: string;
  status: string;
  priority: string;
  deadline?: string;
  createdAt: string;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function StatCard({ label, value, icon, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0', bgColor)}>
        <span className={color}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export function EmployeeDashboard() {
  const { user } = useSelector(selectAuth);
  const { data: tasksData, isLoading: tasksLoading } = useGetTasksQuery({});
  const { data: notifData } = useGetNotificationsQuery({ limit: 5 });

  const tasks: TaskItem[] = tasksData?.data?.tasks ?? [];
  const notifications = notifData?.data?.notifications ?? [];
  const unreadCount = notifications.filter((n: { isRead: boolean }) => !n.isRead).length;

  const stats = {
    pending: tasks.filter((t) => t.status === 'pending').length,
    approved: tasks.filter((t) => t.status === 'approved').length,
    rejected: tasks.filter((t) => t.status === 'rejected').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  const recentTasks = [...tasks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  const overdueTasks = tasks.filter(
    (t) => t.deadline && new Date(t.deadline) < new Date() && t.status === 'pending'
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here's what's happening with your tasks today.
          </p>
        </div>
        <Link to="/tasks/create" className={cn(buttonVariants({ variant: 'default' }), "bg-primary hover:bg-primary/90 text-primary-foreground")}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Link>
      </div>

      {/* Stat Cards */}
      {tasksLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 h-[88px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Pending Review"
            value={stats.pending}
            icon={<Clock className="h-6 w-6" />}
            color="text-warning"
            bgColor="bg-warning/10"
          />
          <StatCard
            label="Approved"
            value={stats.approved}
            icon={<CheckCircle2 className="h-6 w-6" />}
            color="text-success"
            bgColor="bg-success/10"
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            icon={<ThumbsDown className="h-6 w-6" />}
            color="text-destructive"
            bgColor="bg-destructive/10"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={<ListTodo className="h-6 w-6" />}
            color="text-primary"
            bgColor="bg-primary/10"
          />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-heading font-semibold text-foreground">Recent Tasks</h2>
            <Link to="/tasks" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), "text-primary hover:text-primary/80")}>
              View all <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {tasksLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-5 bg-muted rounded-full w-16 ml-auto" />
                </div>
              ))
            ) : recentTasks.length === 0 ? (
              <div className="px-5 py-8 text-center text-muted-foreground text-sm">
                <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-40" />
                No tasks yet. Create your first task!
              </div>
            ) : (
              recentTasks.map((task) => (
                <Link
                  key={task._id}
                  to={`/tasks/${task._id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {task.title}
                    </p>
                    {task.deadline && (
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">
                        Due {format(new Date(task.deadline), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Notifications widget */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-semibold text-foreground">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-mono font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <Link to="/notifications" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), "text-primary hover:text-primary/80")}>
                View all <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {notifications.length === 0 ? (
                <div className="px-5 py-6 text-center text-muted-foreground text-sm">
                  <Bell className="h-6 w-6 mx-auto mb-2 opacity-40" />
                  No notifications
                </div>
              ) : (
                notifications.slice(0, 4).map((n: { _id: string; message: string; isRead: boolean; createdAt: string }) => (
                  <div
                    key={n._id}
                    className={cn(
                      'px-5 py-3',
                      !n.isRead && 'bg-primary/5'
                    )}
                  >
                    <p className="text-xs text-foreground leading-relaxed">{n.message}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-1">
                      {format(new Date(n.createdAt), 'MMM dd, h:mm a')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Overdue tasks */}
          {overdueTasks.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-destructive" />
                <h3 className="text-sm font-semibold text-destructive">
                  {overdueTasks.length} Overdue
                </h3>
              </div>
              <div className="space-y-2">
                {overdueTasks.slice(0, 3).map((t) => (
                  <Link
                    key={t._id}
                    to={`/tasks/${t._id}`}
                    className="block text-xs text-destructive hover:underline truncate"
                  >
                    {t.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Progress ring */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Overall Progress</h3>
            </div>
            {tasks.length > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Completed</span>
                  <span className="font-mono">{Math.round((stats.completed / tasks.length) * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${(stats.completed / tasks.length) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.completed} of {tasks.length} tasks completed
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No tasks yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
