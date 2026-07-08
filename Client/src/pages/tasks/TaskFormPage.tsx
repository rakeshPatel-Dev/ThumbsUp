import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from '@/store/api/taskApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  title: string;
  description: string;
  priority: string;
  deadline: string;
  category: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  priority?: string;
  deadline?: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="h-3.5 w-20 rounded bg-muted" />
          <div className="h-9 w-full rounded-lg bg-muted" />
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateForInput(isoDate?: string): string {
  if (!isoDate) return '';
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return '';
    // yyyy-MM-dd
    return d.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function TaskFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
    category: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing task for edit mode
  const { data: taskData, isLoading: isLoadingTask, isError: isTaskError } = useGetTaskByIdQuery(
    id!,
    { skip: !isEditMode }
  );

  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();

  // Pre-fill form when task data loads
  useEffect(() => {
    if (isEditMode && taskData?.data?.task) {
      const t = taskData.data.task;
      setForm({
        title: t.title ?? '',
        description: t.description ?? '',
        priority: t.priority ?? 'medium',
        deadline: formatDateForInput(t.deadline),
        category: Array.isArray(t.category) ? t.category.join(', ') : (t.category ?? ''),
      });
    }
  }, [taskData, isEditMode]);

  // ─── Field updater ────────────────────────────────────────────────────────

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  // ─── Validation ───────────────────────────────────────────────────────────

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.priority) newErrors.priority = 'Priority is required';
    if (!form.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const d = new Date(form.deadline);
      if (isNaN(d.getTime())) newErrors.deadline = 'Please enter a valid date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const categoryArray = form.category
        ? form.category
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean)
        : [];

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        deadline: new Date(form.deadline).toISOString(),
        category: categoryArray,
      };

      if (isEditMode) {
        await updateTask({ id: id!, ...payload }).unwrap();
        toast.success('Task updated successfully');
      } else {
        await createTask(payload).unwrap();
        toast.success('Task created successfully');
      }
      navigate('/tasks');
    } catch (err) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        (isEditMode ? 'Failed to update task' : 'Failed to create task');
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ─── Render error state (edit mode only) ─────────────────────────────────

  if (isEditMode && isTaskError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center p-8">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="size-8 text-destructive" />
        </div>
        <div>
          <p className="font-heading font-semibold text-foreground text-lg">Task not found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Unable to load task data. It may have been deleted.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
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

      {/* Page header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
          {isEditMode ? 'Edit Task' : 'Create Task'}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isEditMode
            ? 'Update the details of your task'
            : 'Fill in the details to create a new task'}
        </p>
      </div>

      {/* Form card */}
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Task Information' : 'New Task'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditMode && isLoadingTask ? (
            <FormSkeleton />
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  className={errors.title ? 'border-destructive' : ''}
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the task in detail…"
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  className={`min-h-[120px] resize-y ${errors.description ? 'border-destructive' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description}</p>
                )}
              </div>

              {/* Priority + Deadline row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Priority */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="priority">
                    Priority <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.priority}
                    onValueChange={(v) => setField('priority', v ?? 'medium')}
                  >
                    <SelectTrigger
                      id="priority"
                      className={`w-full ${errors.priority ? 'border-destructive' : ''}`}
                    >
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.priority && (
                    <p className="text-xs text-destructive">{errors.priority}</p>
                  )}
                </div>

                {/* Deadline */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="deadline">
                    Deadline <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setField('deadline', e.target.value)}
                    className={errors.deadline ? 'border-destructive' : ''}
                    disabled={isSubmitting}
                    min={new Date().toISOString().slice(0, 10)}
                  />
                  {errors.deadline && (
                    <p className="text-xs text-destructive">{errors.deadline}</p>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="category">
                  Categories
                  <span className="text-muted-foreground text-xs ml-1.5">(comma-separated)</span>
                </Label>
                <Input
                  id="category"
                  placeholder="e.g. design, frontend, urgent"
                  value={form.category}
                  onChange={(e) => setField('category', e.target.value)}
                  disabled={isSubmitting}
                />
                {form.category && (
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {form.category
                      .split(',')
                      .map((c) => c.trim())
                      .filter(Boolean)
                      .map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono border border-border bg-muted text-muted-foreground"
                        >
                          {cat}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <Button type="submit" size="sm" className="gap-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {isEditMode ? 'Saving…' : 'Creating…'}
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      {isEditMode ? 'Save Changes' : 'Create Task'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
