import { useState, useCallback } from 'react';

import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  BadgeCheck,
  Calendar,
  User,
  Kanban,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useGetTasksQuery, useUpdateTaskMutation } from '@/store/api/taskApi';
import { PriorityBadge } from '@/components/common/PriorityBadge';

// ─── Types ──────────────────────────────────────────────────────────────────

type TaskStatus = 'pending' | 'approved' | 'rejected' | 'completed';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: string;
  assignedTo?: { name: string; id: string };
  createdBy?: { name: string; id: string };
  deadline?: string;
  createdAt: string;
}

interface Column {
  id: TaskStatus;
  title: string;
  icon: React.ReactNode;
  accentClass: string;
  badgeClass: string;
  headerBg: string;
}

// ─── Column Config ──────────────────────────────────────────────────────────

const COLUMNS: Column[] = [
  {
    id: 'pending',
    title: 'Pending',
    icon: <Clock className="h-4 w-4" />,
    accentClass: 'border-t-primary',
    badgeClass: 'bg-primary/15 text-primary',
    headerBg: 'bg-primary/5',
  },
  {
    id: 'approved',
    title: 'Approved',
    icon: <CheckCircle2 className="h-4 w-4" />,
    accentClass: 'border-t-success',
    badgeClass: 'bg-success/15 text-success',
    headerBg: 'bg-success/5',
  },
  {
    id: 'rejected',
    title: 'Rejected',
    icon: <XCircle className="h-4 w-4" />,
    accentClass: 'border-t-destructive',
    badgeClass: 'bg-destructive/15 text-destructive',
    headerBg: 'bg-destructive/5',
  },
  {
    id: 'completed',
    title: 'Completed',
    icon: <BadgeCheck className="h-4 w-4" />,
    accentClass: 'border-t-[var(--chart-2)]',
    badgeClass: 'bg-[var(--chart-2)]/15 text-[var(--chart-2)]',
    headerBg: 'bg-[var(--chart-2)]/5',
  },
];

// ─── Sortable Task Card ─────────────────────────────────────────────────────

interface SortableTaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

function SortableTaskCard({ task, isOverlay = false }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task, type: 'task' } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-card border border-border rounded-lg p-3.5 shadow-sm hover:shadow-md transition-all cursor-default select-none ${
        isOverlay ? 'rotate-2 shadow-lg ring-2 ring-primary/30' : ''
      } ${isDragging ? 'z-50' : ''}`}
    >
      {/* Drag handle + title row */}
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none"
          tabIndex={-1}
          aria-label="Drag task"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <p className="text-sm font-medium text-foreground leading-snug flex-1 line-clamp-2">
          {task.title}
        </p>
      </div>

      {/* Priority badge */}
      <div className="mt-2.5 ml-6">
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Footer row */}
      <div className="mt-3 ml-6 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1 truncate">
          <User className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{task.assignedTo?.name ?? 'Unassigned'}</span>
        </div>
        {task.deadline && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(task.deadline), 'MMM d')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Kanban Column ──────────────────────────────────────────────────────────

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  isOver: boolean;
}

function KanbanColumn({ column, tasks, isOver }: KanbanColumnProps) {
  return (
    <div
      className={`flex flex-col rounded-xl border-2 border-t-4 border-border ${column.accentClass} bg-card shadow-sm min-w-[260px] flex-1 transition-colors ${
        isOver ? 'ring-2 ring-primary/40 bg-primary/5' : ''
      }`}
    >
      {/* Column header */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl ${column.headerBg} border-b border-border`}>
        <div className="flex items-center gap-2">
          <span className="text-foreground/70">{column.icon}</span>
          <h3 className="text-sm font-semibold font-heading text-foreground">{column.title}</h3>
        </div>
        <span
          className={`inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-xs font-mono font-bold ${column.badgeClass}`}
        >
          {tasks.length}
        </span>
      </div>

      {/* Task list */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          data-column-id={column.id}
          className="flex-1 flex flex-col gap-2.5 p-3 min-h-[200px] overflow-y-auto max-h-[calc(100vh-280px)]"
        >
          {tasks.length === 0 && (
            <div className="flex-1 flex items-center justify-center py-10">
              <p className="text-xs text-muted-foreground/60 text-center italic">
                No tasks here
              </p>
            </div>
          )}
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

// ─── Skeleton Column ────────────────────────────────────────────────────────

function SkeletonColumn() {
  return (
    <div className="flex flex-col rounded-xl border-2 border-t-4 border-border bg-card shadow-sm min-w-[260px] flex-1 animate-pulse">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-5 w-8 bg-muted rounded-full" />
      </div>
      <div className="flex flex-col gap-2.5 p-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted rounded-lg p-3.5 space-y-2">
            <div className="h-3.5 w-4/5 bg-muted-foreground/20 rounded" />
            <div className="h-3 w-2/5 bg-muted-foreground/20 rounded" />
            <div className="flex justify-between mt-2">
              <div className="h-3 w-1/3 bg-muted-foreground/20 rounded" />
              <div className="h-3 w-1/4 bg-muted-foreground/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main KanbanPage ────────────────────────────────────────────────────────

export function KanbanPage() {
  
  const { data, isLoading, isError } = useGetTasksQuery({});
  const [updateTask] = useUpdateTaskMutation();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overColumnId, setOverColumnId] = useState<TaskStatus | null>(null);

  const tasks: Task[] = data?.data?.tasks ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Group tasks by status
  const tasksByStatus = useCallback(
    (status: TaskStatus) => tasks.filter((t) => t.status === status),
    [tasks]
  );

  // Find the column a draggable is over
  const findColumnForOverId = (overId: string | null): TaskStatus | null => {
    if (!overId) return null;
    // Check if overId is a column data attribute
    const col = COLUMNS.find((c) => c.id === overId);
    if (col) return col.id;
    // Otherwise check if overId is a task id
    const task = tasks.find((t) => t.id === overId);
    return task ? task.status : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    const colId = findColumnForOverId(over?.id as string ?? null);
    setOverColumnId(colId);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setOverColumnId(null);

    if (!over) return;

    const draggedTask = tasks.find((t) => t.id === active.id);
    if (!draggedTask) return;

    const targetColumnId = findColumnForOverId(over.id as string);
    if (!targetColumnId || targetColumnId === draggedTask.status) return;

    try {
      await updateTask({ id: draggedTask.id, status: targetColumnId }).unwrap();
      toast.success(`Task moved to ${targetColumnId}`);
    } catch {
      toast.error('Failed to update task status');
    }
  };

  // ── CSV Export ────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ['Title', 'Status', 'Priority', 'Assigned To', 'Created By', 'Deadline', 'Created At'];
    const rows = tasks.map((t) => [
      `"${t.title.replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.assignedTo?.name ?? '',
      t.createdBy?.name ?? '',
      t.deadline ? format(new Date(t.deadline), 'yyyy-MM-dd') : '',
      format(new Date(t.createdAt), 'yyyy-MM-dd'),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Tasks exported as CSV');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Kanban className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">Task Board</h1>
            <p className="text-sm text-muted-foreground">Manage and track task approval workflows</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={isLoading || tasks.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive mb-4">
          Failed to load tasks. Please refresh the page.
        </div>
      )}

      {/* Summary strip */}
      {!isLoading && (
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground flex-shrink-0">
          <span className="font-mono">
            <span className="font-semibold text-foreground">{tasks.length}</span> total tasks
          </span>
          {COLUMNS.map((col) => (
            <span key={col.id} className="flex items-center gap-1">
              <span className={`inline-block h-2 w-2 rounded-full ${col.badgeClass}`} />
              {tasksByStatus(col.id).length} {col.title.toLowerCase()}
            </span>
          ))}
        </div>
      )}

      {/* Kanban board */}
      {isLoading ? (
        <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((i) => <SkeletonColumn key={i} />)}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={tasksByStatus(col.id)}
                isOver={overColumnId === col.id}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <SortableTaskCard task={activeTask} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
