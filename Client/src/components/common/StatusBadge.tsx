import { cn } from '@/lib/utils';

type Status = 'pending' | 'approved' | 'rejected' | 'completed';

const STATUS_CONFIG: Record<Status, { label: string; classes: string }> = {
  pending: {
    label: 'Pending',
    classes: 'bg-warning/15 text-warning border-warning/30',
  },
  approved: {
    label: 'Approved',
    classes: 'bg-success/15 text-success border-success/30',
  },
  rejected: {
    label: 'Rejected',
    classes: 'bg-destructive/15 text-destructive border-destructive/30',
  },
  completed: {
    label: 'Completed',
    classes: 'bg-primary/10 text-primary border-primary/30',
  },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = status?.toLowerCase() as Status;
  const config = STATUS_CONFIG[key] ?? {
    label: status,
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
