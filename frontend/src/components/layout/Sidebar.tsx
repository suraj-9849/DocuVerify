import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, LogOut, ChevronLeft, LayoutDashboard, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={cn(
        'flex flex-col border-r-2 border-border bg-background text-foreground transition-all duration-200 sticky top-0 h-screen',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className={cn(
        'flex h-14 items-center border-b-2 border-border',
        collapsed ? 'justify-center' : 'px-4'
      )}>
        {!collapsed && (
          <span className="font-bold" style={{ fontSize: '0.9rem' }}>DocuVerify</span>
        )}
      </div>

      <div className="flex-1 space-y-1.5 p-3 overflow-y-auto">
        <Link
          to="/dashboard"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 text-sm font-semibold border-2 transition-all',
            isActive('/dashboard')
              ? 'bg-foreground text-background border-border'
              : 'border-transparent hover:border-border hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-card'
          )}
        >
          <LayoutDashboard className="h-5 w-5 shrink-0" />
          {!collapsed && 'Dashboard'}
        </Link>

        {user.role === 'AUTHOR' && (
          <Link
            to="/documents/new"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 text-sm font-semibold border-2 border-transparent transition-all',
              'hover:border-border hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-card'
            )}
          >
            <Plus className="h-5 w-5 shrink-0" />
            {!collapsed && 'New document'}
          </Link>
        )}

        {user.role === 'ADMIN' && (
          <Link
            to="/admin/users"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 text-sm font-semibold border-2 transition-all',
              isActive('/admin/users')
                ? 'bg-foreground text-background border-border'
                : 'border-transparent hover:border-border hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-card'
            )}
          >
            <Users className="h-5 w-5 shrink-0" />
            {!collapsed && 'Users'}
          </Link>
        )}
      </div>

      <div className="border-t-2 border-border p-3 space-y-1.5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold border-2 border-transparent hover:border-border hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-card transition-all',
            collapsed && 'justify-center px-0'
          )}
        >
          <ChevronLeft className={cn('h-4 w-4 shrink-0 transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && 'Collapse'}
        </button>
        <button
          onClick={toggleTheme}
          className={cn(
            'flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold border-2 border-transparent hover:border-border hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-card transition-all',
            collapsed && 'justify-center px-0'
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            {theme === 'dark'
              ? <><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></>
              : <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></>
            }
          </svg>
          {!collapsed && (theme === 'dark' ? 'Light mode' : 'Dark mode')}
        </button>

        {collapsed ? (
          <button
            onClick={async () => { await logout(); navigate('/'); }}
            className="flex w-full items-center justify-center px-3 py-2.5 border-2 border-transparent hover:border-border hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-card transition-all"
          >
            <LogOut className="h-5 w-5" />
          </button>
        ) : (
          <div className="flex items-center justify-between px-3 py-2 border-2 border-border">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7 text-xs">{initials(user.name)}</Avatar>
              <div className="leading-tight">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="dv-mono" style={{ fontSize: '10px', letterSpacing: '1px', color: 'var(--muted-foreground)' }}>
                  {user.role}
                </p>
              </div>
            </div>
            <button
              onClick={async () => { await logout(); navigate('/'); }}
              className="flex h-7 w-7 items-center justify-center border-2 border-border hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-card transition-all"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
