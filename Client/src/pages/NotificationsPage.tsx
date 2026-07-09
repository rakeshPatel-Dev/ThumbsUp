import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
} from '@/store/api/notificationApi';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  Loader2,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data, isLoading } = useGetNotificationsQuery({});
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [deleteNotif] = useDeleteNotificationMutation();
  const [deleteAllNotifs] = useDeleteAllNotificationsMutation();

  const notifications = data?.data?.notifications ?? [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n: any) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const handleMarkAllRead = async () => {
    try {
      await markAllRead({}).unwrap();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.isRead) {
      try {
        await markRead(n.id).unwrap();
      } catch {
        // silently ignore error
      }
    }
    if (n.entityId) {
      // Navigate to task details page
      navigate(`/tasks/${n.entityId}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotif(id).unwrap();
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifs({}).unwrap();
      toast.success('All notifications deleted');
    } catch {
      toast.error('Failed to delete all notifications');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-75 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">Stay updated on task actions</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button onClick={handleMarkAllRead} variant="outline" size="sm">
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors',
            filter === 'all'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          All Notifications
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            'px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5',
            filter === 'unread'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-mono font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        {notifications.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="ml-auto px-4 py-2.5 text-sm font-semibold text-destructive hover:text-destructive/80 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-1 inline-block" />
            Delete All
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-xl shadow-sm divide-y divide-border overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <BellOff className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((n: any) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={cn(
                'flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer group relative',
                !n.isRead && 'bg-primary/5'
              )}
            >
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                !n.isRead ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <p className="text-sm text-foreground leading-relaxed font-sans">{n.message}</p>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground font-mono">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(n.createdAt), 'MMM dd, yyyy h:mm a')}</span>
                </div>
              </div>
              
              {/* Delete action */}
              <button
                onClick={(e) => handleDelete(e, n._id)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                title="Delete notification"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
