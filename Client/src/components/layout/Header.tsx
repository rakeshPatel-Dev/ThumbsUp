import { Bell, Menu, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/store/store';
import { useGetNotificationsQuery } from '@/store/api/notificationApi';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useSelector(selectAuth);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: notifData } = useGetNotificationsQuery({ limit: 5 });
  const unreadCount = notifData?.data?.notifications?.filter(
    (n: { isRead: boolean }) => !n.isRead
  ).length ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-background/80 backdrop-blur-sm border-b border-border">
      {/* Left – menu + search */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden h-9 w-9 text-muted-foreground"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9 w-64 h-9 bg-muted/50 border-border focus:bg-background"
          />
        </form>
      </div>

      {/* Right – actions */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary border-2 border-background" />
          )}
        </Button>

        {/* Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="ml-1 h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-sm hover:bg-primary/25 transition-colors"
          aria-label="Profile"
        >
          {user?.name?.charAt(0).toUpperCase() ?? 'U'}
        </button>
      </div>
    </header>
  );
}
