import { Link } from 'react-router-dom';

import { useGetTasksQuery } from '@/store/api/taskApi';
import { useGetUsersQuery } from '@/store/api/userApi';
import { useUpdateTaskMutation } from '@/store/api/taskApi';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  ClipboardList, Users, CheckCircle2, Clock,
  ArrowRight, Check, X,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskItem {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  deadline?: string;
  createdAt: string;
  createdBy?: { name: string; _id: string };
  assignedTo?: { name: string; _id: string };
}

export function ManagerDashboard() {
  const { data: tasksData, isLoading: tasksLoading } = useGetTasksQuery({});
  const { data: usersData } = useGetUsersQuery({ role: 'employee' });
  const [updateTask, { isLoading: updating }] = useUpdateTaskMutation();

  const tasks: TaskItem[] = tasksData?.data?.tasks ?? [];
  const employees = usersData?.data?.users ?? [];

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const approvedToday = tasks.filter(
    (t) => t.status === 'approved' && new Date(t.createdAt).toDateString() === new Date().toDateString()
  );

  const handleApprove = async (id: string) => {
    try {
      await updateTask({ id, status: 'approved' }).unwrap();
      toast.success('Task approved');
    } catch {
      toast.error('Failed to approve task');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateTask({ id, status: 'rejected' }).unwrap();
      toast.success('Task rejected');
    } catch {
      toast.error('Failed to reject task');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Manager Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review and manage your team's tasks.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-3xl font-heading font-bold text-primary">{pendingTasks.length}</p>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-warning" /> Pending Review
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-3xl font-heading font-bold text-success">{approvedToday.length}</p>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-success" /> Approved Today
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-3xl font-heading font-bold text-foreground">{tasks.length}</p>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4 text-primary" /> Total Tasks
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-3xl font-heading font-bold text-foreground">{employees.length}</p>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-chart-2" /> Team Members
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending for Review */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-semibold text-foreground">Pending Review</h2>
              {pendingTasks.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-warning/15 text-warning">
                  {pendingTasks.length}
                </span>
              )}
            </div>
            <Link to="/tasks?status=pending" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), "text-primary hover:text-primary/80")}>
              View all <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {tasksLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="px-5 py-4 animate-pulse flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-20 bg-muted rounded-lg" />
                    <div className="h-8 w-20 bg-muted rounded-lg" />
                  </div>
                </div>
              ))
            ) : pendingTasks.length === 0 ? (
              <div className="px-5 py-10 text-center text-muted-foreground text-sm">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success opacity-60" />
                All caught up! No pending tasks.
              </div>
            ) : (
              pendingTasks.slice(0, 8).map((task) => (
                <div key={task._id} className="px-5 py-4 flex items-start gap-4 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/tasks/${task._id}`}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate block"
                    >
                      {task.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <PriorityBadge priority={task.priority} />
                      {task.createdBy && (
                        <span className="text-xs text-muted-foreground font-mono">
                          by {task.createdBy.name}
                        </span>
                      )}
                      {task.deadline && (
                        <span className={cn(
                          'text-xs font-mono',
                          new Date(task.deadline) < new Date() ? 'text-destructive' : 'text-muted-foreground'
                        )}>
                          Due {format(new Date(task.deadline), 'MMM dd')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-success border-success/30 hover:bg-success/10"
                      onClick={() => handleApprove(task._id)}
                      disabled={updating}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => handleReject(task._id)}
                      disabled={updating}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Overview */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-heading font-semibold text-foreground">Team Activity</h2>
            </div>
            <div className="p-4 space-y-3">
              {/* Task status breakdown */}
              {[
                { label: 'Pending', count: tasks.filter((t) => t.status === 'pending').length, color: 'bg-warning' },
                { label: 'Approved', count: tasks.filter((t) => t.status === 'approved').length, color: 'bg-success' },
                { label: 'Rejected', count: tasks.filter((t) => t.status === 'rejected').length, color: 'bg-destructive' },
                { label: 'Completed', count: tasks.filter((t) => t.status === 'completed').length, color: 'bg-primary' },
              ].map(({ label, count, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{label}</span>
                    <span className="font-mono">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', color)}
                      style={{ width: tasks.length ? `${(count / tasks.length) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent team members */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-heading font-semibold text-foreground">Team Members</h2>
            </div>
            <div className="divide-y divide-border">
              {employees.slice(0, 5).map((emp: { _id: string; name: string; email: string; role: string }) => (
                <div key={emp._id} className="flex items-center gap-3 px-5 py-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                    {emp.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{emp.name}</p>
                    <p className="text-xs font-mono text-muted-foreground capitalize">{emp.role}</p>
                  </div>
                </div>
              ))}
              {employees.length === 0 && (
                <p className="px-5 py-4 text-sm text-muted-foreground text-center">No team members yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
