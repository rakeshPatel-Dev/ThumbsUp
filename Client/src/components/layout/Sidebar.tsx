import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuth } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { useLogoutMutation } from '@/store/api/authApi';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  ThumbsUp,
  LayoutDashboard,
  ClipboardList,
  Bell,
  User,
  Users,
  BarChart3,
  ScrollText,
  Kanban,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ['employee', 'manager', 'admin'],
  },
  {
    label: 'My Tasks',
    to: '/tasks',
    icon: <ClipboardList className="h-5 w-5" />,
    roles: ['employee', 'manager'],
  },
  {
    label: 'Notifications',
    to: '/notifications',
    icon: <Bell className="h-5 w-5" />,
    roles: ['employee', 'manager', 'admin'],
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: <User className="h-5 w-5" />,
    roles: ['employee', 'manager', 'admin'],
  },
  // Admin-only
  {
    label: 'Manage Users',
    to: '/admin/users',
    icon: <Users className="h-5 w-5" />,
    roles: ['admin'],
  },
  {
    label: 'Analytics',
    to: '/admin/analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    roles: ['admin'],
  },
  {
    label: 'System Logs',
    to: '/admin/logs',
    icon: <ScrollText className="h-5 w-5" />,
    roles: ['admin'],
  },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { user } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutMutation] = useLogoutMutation();

  const role = user?.role ?? 'employee';
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const handleLogout = async () => {
    try {
      await logoutMutation({}).unwrap();
    } catch {
      // ignore – server may already have cleared the session
    } finally {
      dispatch(logout());
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
        <ThumbsUp className="h-6 w-6 text-primary" fill="currentColor" />
        <div>
          <h1 className="font-heading text-lg font-bold text-primary leading-none">ThumbsUp</h1>
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
            Task Manager
          </p>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-sm">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs font-mono text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {/* Divider for admin section */}
        {role === 'admin' && (
          <>
            {visibleItems
              .filter((i) => !i.roles.every((r) => r === 'admin'))
              .map((item) => (
                <SidebarLink key={item.to} item={item} onClose={onClose} />
              ))}
            <div className="pt-3 pb-1 px-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Admin
              </p>
            </div>
            {visibleItems
              .filter((i) => i.roles.every((r) => r === 'admin'))
              .map((item) => (
                <SidebarLink key={item.to} item={item} onClose={onClose} />
              ))}
          </>
        )}
        {role !== 'admin' &&
          visibleItems.map((item) => (
            <SidebarLink key={item.to} item={item} onClose={onClose} />
          ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors group"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
          <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
}

function SidebarLink({ item, onClose }: { item: NavItem; onClose?: () => void }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClose}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
          isActive
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className={cn(isActive ? 'text-primary' : 'text-muted-foreground')}>
            {item.icon}
          </span>
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  );
}
