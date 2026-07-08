import { useGetDashboardStatsQuery } from '@/store/api/adminApi';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  Users,
  ClipboardList,
  Clock,
  TrendingUp,
  BarChart3,
  Loader2,
  Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

function MetricCard({ label, value, icon, bgColor, textColor }: MetricCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${bgColor}`}>
          <span className={textColor}>{icon}</span>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const { data, isLoading, isError } = useGetDashboardStatsQuery({});

  const dashboardData = data?.data ?? {};
  const stats = dashboardData.stats ?? {};
  const taskTrends = dashboardData.taskTrends ?? { labels: [], created: [], completed: [] };
  const userGrowth = dashboardData.userGrowth ?? { labels: [], newUsers: [] };

  const totalUsers = stats.totalUsers ?? 0;
  const totalTasks = stats.totalTasks ?? 0;
  const pendingTasks = stats.pendingTasks ?? 0;
  const completedTasks = stats.completedTasks ?? 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Format Recharts data structures
  const statusBreakdownData = [
    { name: 'Pending', count: stats.pendingTasks ?? 0, fill: 'var(--primary)' },
    { name: 'Approved', count: stats.approvedTasks ?? 0, fill: '#386a20' },
    { name: 'Rejected', count: stats.rejectedTasks ?? 0, fill: 'var(--destructive)' },
    { name: 'Completed', count: stats.completedTasks ?? 0, fill: 'var(--chart-2)' },
  ];

  const trendChartData = (taskTrends.labels ?? []).map((label: string, index: number) => ({
    name: label,
    Created: taskTrends.created?.[index] ?? 0,
    Completed: taskTrends.completed?.[index] ?? 0,
  }));

  const growthChartData = (userGrowth.labels ?? []).map((label: string, index: number) => ({
    name: label,
    'New Users': userGrowth.newUsers?.[index] ?? 0,
  }));

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading analytics data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-5 text-center max-w-md mx-auto my-10">
        <p className="text-destructive font-semibold">Failed to load analytics</p>
        <p className="text-xs text-muted-foreground mt-1">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">System-wide performance overview</p>
          </div>
        </div>
        <Button onClick={handlePrint} variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Users"
          value={totalUsers}
          icon={<Users className="h-5 w-5" />}
          bgColor="bg-primary/10"
          textColor="text-primary"
        />
        <MetricCard
          label="Total Tasks"
          value={totalTasks}
          icon={<ClipboardList className="h-5 w-5" />}
          bgColor="bg-chart-2/10"
          textColor="text-chart-2"
        />
        <MetricCard
          label="Pending Review"
          value={pendingTasks}
          icon={<Clock className="h-5 w-5" />}
          bgColor="bg-warning/10"
          textColor="text-warning"
        />
        <MetricCard
          label="Completion Rate"
          value={`${completionRate}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          bgColor="bg-success/10"
          textColor="text-success"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Task Status Breakdown */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-4">Task Status Breakdown</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-xs" />
                <YAxis stroke="currentColor" className="text-muted-foreground text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusBreakdownData.map((entry, index) => (
                    <Bar key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-4">User Registrations (Last 6 Months)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-xs" />
                <YAxis stroke="currentColor" className="text-muted-foreground text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
                <Legend className="text-xs text-muted-foreground" />
                <Line type="monotone" dataKey="New Users" stroke="var(--primary)" strokeWidth={2.5} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Activity Trends */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm md:col-span-2">
          <h2 className="text-base font-semibold text-foreground mb-4">Task Creation vs. Completion Trends</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#386a20" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#386a20" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-xs" />
                <YAxis stroke="currentColor" className="text-muted-foreground text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
                <Legend className="text-xs text-muted-foreground" />
                <Area type="monotone" dataKey="Created" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorCreated)" />
                <Area type="monotone" dataKey="Completed" stroke="#386a20" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
