import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Search, Users, ShieldCheck, UserX, ChevronDown } from 'lucide-react';
import { useGetUsersQuery, useUpdateUserRoleMutation, useSuspendUserMutation } from '@/store/api/userApi';

// ─── Types ──────────────────────────────────────────────────────────────────

type UserRole = 'employee' | 'manager' | 'admin';

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
}

const ROLES: { value: string; label: string }[] = [
  { value: 'all', label: 'All Roles' },
  { value: 'employee', label: 'Employee' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
];

const ROLE_COLORS: Record<UserRole, string> = {
  employee: 'bg-muted text-muted-foreground border-border',
  manager: 'bg-primary/10 text-primary border-primary/30',
  admin: 'bg-destructive/10 text-destructive border-destructive/30',
};

// ─── Skeleton Row ────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-border animate-pulse">
      {[160, 200, 100, 100, 120, 140].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className={`h-3.5 bg-muted rounded`} style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Main UsersPage ──────────────────────────────────────────────────────────

export function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const queryParams: Record<string, string> = {};
  if (search.trim()) queryParams.search = search.trim();
  if (roleFilter !== 'all') queryParams.role = roleFilter;

  const { data, isLoading, isError } = useGetUsersQuery(queryParams);
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [suspendUser] = useSuspendUserMutation();

  const users: AppUser[] = data?.data?.users ?? [];

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      await updateUserRole({ userId, role }).unwrap();
      toast.success('User role updated');
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleToggleSuspend = async (user: AppUser) => {
    const action = user.isActive ? 'suspend' : 'unsuspend';
    try {
      await suspendUser({ userId: user.id, action }).unwrap();
      toast.success(`User ${action === 'suspend' ? 'suspended' : 'activated'}`);
    } catch {
      toast.error(`Failed to ${action} user`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">Users</h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading…' : `${users.length} user${users.length !== 1 ? 's' : ''} total`}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {/* Role filter */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="appearance-none rounded-lg border border-border bg-background pl-3 pr-8 py-2 text-sm text-foreground focus:outline-none cursor-pointer"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {isError && (
          <div className="p-6 text-sm text-destructive text-center">
            Failed to load users. Please refresh.
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-semibold font-mono text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold font-mono text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold font-mono text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold font-mono text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold font-mono text-muted-foreground uppercase tracking-wider">Last Login</th>
                <th className="px-4 py-3 text-left text-xs font-semibold font-mono text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}

              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Users className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No users found</p>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  {/* Name */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold font-heading">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        {user.isEmailVerified && (
                          <p className="text-[10px] text-success font-mono">verified</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs">
                    {user.email}
                  </td>

                  {/* Role – inline editable select */}
                  <td className="px-4 py-3.5">
                    <div className="relative inline-block">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className={`appearance-none rounded-full border px-3 py-1 text-xs font-mono font-medium pr-6 focus:outline-none cursor-pointer ${ROLE_COLORS[user.role]}`}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 opacity-60" />
                    </div>
                  </td>

                  {/* Status badge */}
                  <td className="px-4 py-3.5">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-xs font-mono font-medium text-success">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-xs font-mono font-medium text-destructive">
                        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                        Suspended
                      </span>
                    )}
                  </td>

                  {/* Last Login */}
                  <td className="px-4 py-3.5 text-muted-foreground text-xs font-mono">
                    {user.lastLogin
                      ? format(new Date(user.lastLogin), 'MMM d, yyyy')
                      : <span className="text-muted-foreground/50 italic">Never</span>
                    }
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => handleToggleSuspend(user)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        user.isActive
                          ? 'border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20'
                          : 'border-success/30 bg-success/10 text-success hover:bg-success/20'
                      }`}
                    >
                      {user.isActive ? (
                        <>
                          <UserX className="h-3.5 w-3.5" />
                          Suspend
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Activate
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
