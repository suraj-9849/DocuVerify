import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { initials } from '@/lib/utils';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center font-semibold">
          <img src="/logo.png" alt="DocuVerify" className="h-8 w-8 object-contain" />
          <span>DocuVerify</span>
        </Link>

        <div className="flex items-center gap-3">
          {user.role === 'AUTHOR' && (
            <Button size="sm" onClick={() => navigate('/documents/new')}>
              <Plus className="h-4 w-4" />
              New document
            </Button>
          )}

          <div className="flex items-center gap-2 pl-2">
            <Avatar>{initials(user.name)}</Avatar>
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-medium">{user.name}</p>
              <Badge variant="secondary" className="text-[10px]">
                {user.role}
              </Badge>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            title="Log out"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
