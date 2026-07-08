import { useState } from 'react';
import { useGetSystemLogsQuery } from '@/store/api/adminApi';
import { format } from 'date-fns';
import {
  ScrollText,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ACTION_LABELS: Record<string, { label: string; classes: string }> = {
  USER_LOGIN: { label: 'Login', classes: 'bg-success/15 text-success' },
  USER_LOGOUT: { label: 'Logout', classes: 'bg-muted text-muted-foreground' },
  USER_REGISTER: { label: 'Register', classes: 'bg-primary/15 text-primary' },
  TASK_CREATE: { label: 'Task Created', classes: 'bg-chart-2/15 text-chart-2' },
  TASK_APPROVED: { label: 'Task Approved', classes: 'bg-success/15 text-success' },
  TASK_REJECTED: { label: 'Task Rejected', classes: 'bg-destructive/15 text-destructive' },
  TASK_COMPLETED: { label: 'Task Completed', classes: 'bg-primary/10 text-primary' },
  EMAIL_VERIFIED: { label: 'Email Verified', classes: 'bg-success/15 text-success' },
  PROFILE_UPDATE: { label: 'Profile Update', classes: 'bg-warning/15 text-warning' },
};

export function LogsPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(1);

  const queryParams: Record<string, any> = { page, limit: 12 };
  if (search.trim()) queryParams.search = search.trim();
  if (actionFilter !== 'all') queryParams.action = actionFilter;

  const { data, isLoading, isError } = useGetSystemLogsQuery(queryParams);

  const logs = data?.data?.logs ?? [];


  const pagination = data?.data?.pagination ?? { page: 1, totalPages: 1, totalLogs: 0 };

  const handleExportCSV = () => {
    if (!logs.length) return;
    const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address'];
    const rows = logs.map((log: any) => [
      log.timestamp ? new Date(log.timestamp).toISOString() : '',
      log.userId ? `${log.userId.name} (${log.userId.email})` : 'System',
      log.action,
      log.entityType,
      log.entityId,
      log.ipAddress || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r: any[]) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `system_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ScrollText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">System Logs</h1>
            <p className="text-sm text-muted-foreground">Audit logs and administrative activity feed</p>
          </div>
        </div>
        <Button onClick={handleExportCSV} variant="outline" size="sm" disabled={!logs.length}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by user name or email..."
            className="pl-9 h-10"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 px-3 border border-input rounded-md bg-background text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full sm:w-48 cursor-pointer"
        >
          <option value="all">All Actions</option>
          <option value="USER_LOGIN">Login</option>
          <option value="USER_LOGOUT">Logout</option>
          <option value="USER_REGISTER">Registration</option>
          <option value="TASK_CREATE">Task Created</option>
          <option value="TASK_APPROVED">Task Approved</option>
          <option value="TASK_REJECTED">Task Rejected</option>
          <option value="TASK_COMPLETED">Task Completed</option>
          <option value="EMAIL_VERIFIED">Email Verified</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity Type</th>
                <th className="px-4 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm text-foreground">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3.5"><div className="h-4 bg-muted rounded w-32" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 bg-muted rounded w-48" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 bg-muted rounded w-24" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 bg-muted rounded w-16" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 bg-muted rounded w-28" /></td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-destructive">
                    Error loading system logs.
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No system logs matched the criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log: any, i: number) => {
                  const cfg = ACTION_LABELS[log.action] ?? { label: log.action, classes: 'bg-muted text-muted-foreground' };
                  return (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                        {log.timestamp ? format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss') : ''}
                      </td>
                      <td className="px-4 py-3.5">
                        {log.user ? (
                          <div>
                            <p className="font-semibold text-foreground">{log.user.name}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">System</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold font-mono border border-current/10 ${cfg.classes}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                        {log.entityType}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                        {log.ip || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3.5 border-t border-border bg-muted/10">
            <p className="text-xs text-muted-foreground">
              Showing page <span className="font-semibold text-foreground">{page}</span> of{' '}
              <span className="font-semibold text-foreground">{pagination.totalPages}</span>
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                disabled={page === pagination.totalPages || isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
