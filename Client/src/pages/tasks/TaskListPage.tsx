import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Plus,
  CheckCircle2,
  CalendarDays,
  User2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  AlertCircle,
  Search,
  X,
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { useGetTasksQuery } from '@/store/api/taskApi';
import { selectAuth } from '@/store/store';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'completed';
type TaskPriority = 'all' | 'low' | 'medium' | 'high' | 'critical';
type SortField = 'createdAt_desc' | 'createdAt_asc' | 'deadline_asc';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  deadline: string;
  createdAt: string;
  category?: string[];
  createdBy?: { id: string; name: string; email: string };
  assignedTo?: { id: string; name: string; email: string };
}

const PAGE_SIZE = 9;

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="h-5 w-3/5 rounded-md bg-muted" />
        <div className="h-5 w-16 rounded-full bg-muted" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3.5 w-full rounded bg-muted" />
        <div className="h-3.5 w-4/5 rounded bg-muted" />
      </div>
      <div className="flex gap-2 mt-1">
        <div className="h-5 w-16 rounded-full bg-muted" />
        <div className="h-5 w-20 rounded-full bg-muted" />
      </div>
      <div className="flex justify-between mt-auto pt-2 border-t border-border">
        <div className="h-3.5 w-28 rounded bg-muted" />
        <div className="h-3.5 w-24 rounded bg-muted" />
      </div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({ task }: { task: Task }) {
  const deadlineDate = task.deadline ? parseISO(task.deadline) : null;
  const deadlineStr =
    deadlineDate && isValid(deadlineDate)
      ? format(deadlineDate, 'MMM dd, yyyy')
      : '—';

  const isOverdue =
    deadlineDate &&
    isValid(deadlineDate) &&
    deadlineDate < new Date() &&
    task.status !== 'completed';

  return (
    <Link
      to={`/tasks/${task.id}`}
      className="group bg-card border border-border rounded-xl shadow-sm p-5 flex flex-col gap-3 hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-3">
        <h3 className="font-heading font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {task.title}
        </h3>
        <StatusBadge status={task.status} className="shrink-0" />
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Priority + category tags */}
      <div className="flex flex-wrap gap-1.5">
        <PriorityBadge priority={task.priority} />
        {task.category?.slice(0, 2).map((cat) => (
          <span
            key={cat}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono border border-border bg-muted text-muted-foreground"
          >
            {cat.trim()}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-border flex justify-between items-center gap-2">
        <span
          className={`flex items-center gap-1 text-xs font-mono ${
            isOverdue ? 'text-destructive' : 'text-muted-foreground'
          }`}
        >
          <CalendarDays className="size-3 shrink-0" />
          {deadlineStr}
        </span>
        {task.createdBy?.name && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground truncate max-w-33">
            <User2 className="size-3 shrink-0" />
            <span className="truncate">{task.createdBy.name}</span>
          </span>
        )}
      </div>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function TaskListPage() {
  const { user } = useSelector(selectAuth);

  const [statusFilter, setStatusFilter] = useState<TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt_desc');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    if (priorityFilter !== 'all') params.priority = priorityFilter;
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (sortField === 'createdAt_desc') {
      params.sortBy = 'createdAt';
      params.sortOrder = 'desc';
    } else if (sortField === 'createdAt_asc') {
      params.sortBy = 'createdAt';
      params.sortOrder = 'asc';
    } else if (sortField === 'deadline_asc') {
      params.sortBy = 'deadline';
      params.sortOrder = 'asc';
    }
    params.page = String(page);
    params.limit = String(PAGE_SIZE);
    return params;
  }, [statusFilter, priorityFilter, searchQuery, sortField, page]);

  const clearFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
    setSortField('createdAt_desc');
    setPage(1);
  }

  const { data, isLoading, isError, error } = useGetTasksQuery(queryParams);

  const tasks: Task[] = data?.data?.tasks ?? [];
  const totalTasks: number = data?.data?.pagination?.total ?? tasks.length;
  const totalPages = Math.max(1, Math.ceil(totalTasks / PAGE_SIZE));

  const resetPage = () => setPage(1);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
            Task List
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {user?.role === 'manager' || user?.role === 'admin'
              ? 'View and manage all team tasks'
              : 'Track and manage your tasks'}
          </p>
        </div>
        {user?.role === 'employee' && (
          <Link to="/tasks/create" className={buttonVariants({ size: 'sm' }) + ' gap-2 shrink-0'}>
            <Plus className="size-4" />
            Create Task
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center bg-card border border-border rounded-xl px-4 py-3">
        <div className="relative flex-1 min-w-45 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search tasks…"
            className="pl-8 h-8 text-sm"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              resetPage();
            }}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as TaskStatus);
            resetPage();
          }}
        >
          <SelectTrigger size="sm" className="min-w-33">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={priorityFilter}
          onValueChange={(v) => {
            setPriorityFilter(v as TaskPriority);
            resetPage();
          }}
        >
          <SelectTrigger size="sm" className="min-w-33">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortField}
          onValueChange={(v) => {
            setSortField(v as SortField);
            resetPage();
          }}
        >
          <SelectTrigger size="sm" className="min-w-40">
            <ArrowUpDown className="size-3.5 text-muted-foreground" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt_desc">Newest First</SelectItem>
            <SelectItem value="createdAt_asc">Oldest First</SelectItem>
            <SelectItem value="deadline_asc">Deadline (Soonest)</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={clearFilters}
        >
          <X className="size-3.5" />
          Clear Filters
        </Button>
      </div>

      {/* Task Grid / States */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="size-8 text-destructive" />
          </div>
          <div>
            <p className="font-heading font-semibold text-foreground">Failed to load tasks</p>
            <p className="text-sm text-muted-foreground mt-1">
              {(error as { data?: { message?: string } })?.data?.message ??
                'An unexpected error occurred. Please try again.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="rounded-full bg-primary/10 p-5">
            <CheckCircle2 className="size-10 text-primary" />
          </div>
          <div>
            <p className="font-heading font-semibold text-foreground text-lg">No tasks found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery
                ? 'Try adjusting your filters or search query.'
                : 'Create your first task to get started.'}
            </p>
          </div>
          {user?.role === 'employee' && (
            <Link to="/tasks/create" className={buttonVariants({ size: 'sm' }) + ' gap-2'}>
              <Plus className="size-4" />
              Create Task
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground font-mono">
              Page{' '}
              <span className="text-foreground font-semibold">{page}</span> of{' '}
              <span className="text-foreground font-semibold">{totalPages}</span>
              {totalTasks > 0 && (
                <span className="ml-2 text-muted-foreground">
                  ({totalTasks} task{totalTasks !== 1 ? 's' : ''})
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-4" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
