import { cn } from '@/lib/utils';

type Priority = 'low' | 'medium' | 'high' | 'critical';

const PRIORITY_CONFIG: Record<Priority, { label: string; classes: string }> = {
  low: {
    label: 'Low',
    classes: 'bg-success/10 text-success border-success/30',
  },
  medium: {
    label: 'Medium',
    classes: 'bg-warning/10 text-warning border-warning/30',
  },
  high: {
    label: 'High',
    classes: 'bg-primary/10 text-primary border-primary/30',
  },
  critical: {
    label: 'Critical',
    classes: 'bg-destructive/15 text-destructive border-destructive/30',
  },
};

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const key = priority?.toLowerCase() as Priority;
  const config = PRIORITY_CONFIG[key] ?? {
    label: priority,
    classes: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium border tracking-wide',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
}
