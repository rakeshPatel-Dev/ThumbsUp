import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  CalendarDays,
  User2,
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  Pencil,
  Trash2,
  AlertCircle,
  History,
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { toast } from 'sonner';
import {
  useGetTaskByIdQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from '@/store/api/taskApi';
import { selectAuth } from '@/store/store';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatusHistoryEntry {
  status: string;
  changedAt: string;
  changedBy?: { id: string; name: string };
  note?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  deadline: string;
  createdAt: string;
  updatedAt?: string;
  category?: string[];
  createdBy?: { id: string; name: string; email: string };
  assignedTo?: { id: string; name: string; email: string };
  statusHistory?: StatusHistoryEntry[];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TaskDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full animate-pulse">
      {/* Back button placeholder */}
      <div className="h-8 w-24 rounded-lg bg-muted" />

      {/* Title */}
      <div className="flex flex-col gap-3">
        <div className="h-8 w-2/3 rounded-lg bg-muted" />
        <div className="flex gap-2">
          <div className="h-5 w-20 rounded-full bg-muted" />
          <div className="h-5 w-20 rounded-full bg-muted" />
        </div>
      </div>

      {/* Card body */}
      <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-4 w-4/6 rounded bg-muted" />
        <div className="grid grid-cols-2 gap-4 mt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-4 w-28 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <div className="h-9 w-24 rounded-lg bg-muted" />
        <div className="h-9 w-24 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

// ─── Timeline Entry ───────────────────────────────────────────────────────────

function TimelineEntry({ entry, isLast }: { entry: StatusHistoryEntry; isLast: boolean }) {
  const date = entry.changedAt ? parseISO(entry.changedAt) : null;
  const dateStr = date && isValid(date) ? format(date, 'MMM dd, yyyy HH:mm') : '—';

  const statusColors: Record<string, string> = {
    pending: 'bg-warning border-warning/40',
    approved: 'bg-success border-success/40',
    rejected: 'bg-destructive border-destructive/40',
    completed: 'bg-primary border-primary/40',
  };
  const dotColor = statusColors[entry.status?.toLowerCase()] ?? 'bg-muted-foreground border-border';

  return (
    <div className="relative flex gap-4">
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-[7px] top-5 w-px h-full bg-border" />
      )}
      {/* Dot */}
      <div className={`mt-0.5 size-3.5 rounded-full border-2 shrink-0 ${dotColor}`} />
      {/* Content */}
      <div className="flex flex-col gap-0.5 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={entry.status} />
          {entry.changedBy?.name && (
            <span className="text-xs text-muted-foreground">
              by <span className="text-foreground font-medium">{entry.changedBy.name}</span>
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-mono">{dateStr}</p>
        {entry.note && (
          <p className="text-xs text-muted-foreground mt-0.5 italic">"{entry.note}"</p>
        )}
      </div>
    </div>
  );
}

// ─── Detail Row ───────────────────────────────────────────────────────────────

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground shrink-0">{icon}</div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div className="text-sm text-foreground">{children}</div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function TaskDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);

  const { data, isLoading, isError, error } = useGetTaskByIdQuery(id!, { skip: !id });
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  if (isLoading) return <TaskDetailsSkeleton />;

  if (isError || !data?.data?.task) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center p-8">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="size-8 text-destructive" />
        </div>
        <div>
          <p className="font-heading font-semibold text-foreground text-lg">Task not found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {(error as { data?: { message?: string } })?.data?.message ??
              'This task may have been deleted or you do not have access.'}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const task: Task = data.data.task;

  const isManager = user?.role === 'manager' || user?.role === 'admin';
  const isOwner = task.createdBy?.id === user?.id;
  const canEdit = isOwner && task.status === 'pending';
  const canDelete = isOwner && task.status === 'pending';
  const canMarkComplete = isOwner && task.status === 'approved';
  const canApproveReject = isManager && task.status === 'pending';
  const canManagerComplete = isManager && task.status === 'approved';

  const deadlineDate = task.deadline ? parseISO(task.deadline) : null;
  const deadlineStr =
    deadlineDate && isValid(deadlineDate) ? format(deadlineDate, 'MMM dd, yyyy') : '—';

  const createdAtDate = task.createdAt ? parseISO(task.createdAt) : null;
  const createdAtStr =
    createdAtDate && isValid(createdAtDate) ? format(createdAtDate, 'MMM dd, yyyy HH:mm') : '—';

  const isOverdue =
    deadlineDate && isValid(deadlineDate) && deadlineDate < new Date() && task.status !== 'completed';

  // ─── Handlers ───────────────────────────────────────────────────────────────

  async function handleStatusChange(status: string, rejectionReason?: string) {
    try {
      const payload: Record<string, string> = { id: task.id, status };
      if (rejectionReason) payload.rejectionReason = rejectionReason;
      await updateTask(payload).unwrap();
      toast.success(
        status === 'approved'
          ? 'Task approved successfully'
          : status === 'rejected'
          ? 'Task rejected'
          : 'Task marked as completed'
      );
    } catch (err) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Failed to update task';
      toast.error(msg);
    }
  }

  async function handleReject() {
    const reason = window.prompt('Rejection reason (optional):');
    if (reason === null) return; // cancelled
    await handleStatusChange('rejected', reason.trim() || undefined);
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) return;
    try {
      await deleteTask(task.id).unwrap();
      toast.success('Task deleted successfully');
      navigate('/tasks');
    } catch (err) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Failed to delete task';
      toast.error(msg);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-fit gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>

      {/* Title + badges */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight leading-snug">
            {task.title}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
        </div>
      </div>

      {/* Main content card */}
      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Description */}
          {task.description && (
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">
                Description
              </p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
            <DetailRow icon={<CalendarDays className="size-4" />} label="Deadline">
              <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                {deadlineStr}
                {isOverdue && ' (Overdue)'}
              </span>
            </DetailRow>

            <DetailRow icon={<Clock className="size-4" />} label="Created At">
              {createdAtStr}
            </DetailRow>

            <DetailRow icon={<User2 className="size-4" />} label="Created By">
              {task.createdBy?.name ?? '—'}
            </DetailRow>

            {task.assignedTo && (
              <DetailRow icon={<User2 className="size-4" />} label="Assigned To">
                {task.assignedTo.name}
              </DetailRow>
            )}

            {task.category && task.category.length > 0 && (
              <DetailRow icon={<Tag className="size-4" />} label="Categories">
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {task.category.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono border border-border bg-muted text-muted-foreground"
                    >
                      {cat.trim()}
                    </span>
                  ))}
                </div>
              </DetailRow>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Timeline */}
      {task.statusHistory && task.statusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="size-4 text-muted-foreground" />
              Status History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              {task.statusHistory.map((entry, idx) => (
                <TimelineEntry
                  key={idx}
                  entry={entry}
                  isLast={idx === task.statusHistory!.length - 1}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Manager/Admin: Approve & Reject */}
        {canApproveReject && (
          <>
            <Button
              size="sm"
              className="gap-2 bg-success/90 hover:bg-success text-white border-0"
              disabled={isUpdating}
              onClick={() => handleStatusChange('approved')}
            >
              <ThumbsUp className="size-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="gap-2"
              disabled={isUpdating}
              onClick={handleReject}
            >
              <XCircle className="size-4" />
              Reject
            </Button>
          </>
        )}

        {/* Manager: Mark Complete on approved tasks */}
        {canManagerComplete && (
          <Button
            size="sm"
            className="gap-2"
            disabled={isUpdating}
            onClick={() => handleStatusChange('completed')}
          >
            <CheckCircle2 className="size-4" />
            Mark Complete
          </Button>
        )}

        {/* Employee: Mark Complete */}
        {canMarkComplete && (
          <Button
            size="sm"
            className="gap-2"
            disabled={isUpdating}
            onClick={() => handleStatusChange('completed')}
          >
            <CheckCircle2 className="size-4" />
            Mark Complete
          </Button>
        )}

        {/* Employee owner: Edit */}
        {canEdit && (
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => navigate(`/tasks/${task.id}/edit`)}
          >
            <Pencil className="size-4" />
            Edit
          </Button>
        )}

        {/* Employee owner: Delete */}
        {canDelete && (
          <Button
            size="sm"
            variant="outline"
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
