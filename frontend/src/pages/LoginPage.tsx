import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/button';

const SEEDED_USERS = [
  { email: 'alice@example.com', role: 'AUTHOR' },
  { email: 'bob@example.com', role: 'REVIEWER' },
  { email: 'carol@example.com', role: 'REVIEWER' },
  { email: 'admin@example.com', role: 'ADMIN' },
  { email: 'viewer@example.com', role: 'VIEWER' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(loginEmail: string) {
    setIsSubmitting(true);
    try {
      await login(loginEmail);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 page-content" style={{ background: 'var(--highlight)' }}>
      <div className="w-full max-w-sm border-2 border-border bg-card p-5">
        <div className="text-center mb-4">
          <img src="/logo.png" alt="DocuVerify" className="mx-auto mb-3 h-20 w-20 object-contain" />
          <h1 className="font-bold" style={{ fontSize: '1.3rem', letterSpacing: '-0.5px' }}>DocuVerify</h1>
          <p className="dv-mono" style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
            Document Verification System
          </p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); handleLogin(email); }}
          className="space-y-3"
        >
          <div>
            <label className="dv-mono block" style={{ fontSize: '10px', letterSpacing: '1px', color: 'var(--muted-foreground)', marginBottom: '0.35rem' }}>
              Email
            </label>
            <input
              type="email"
              placeholder="alice@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="dv-input"
              style={{ padding: '8px 10px', fontSize: '0.85rem' }}
            />
          </div>
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Sign in
          </Button>
        </form>

        <div className="mt-4 pt-4 border-t-2 border-border text-center">
          <p className="dv-mono" style={{ fontSize: '10px', letterSpacing: '1px', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
            Quick login
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {SEEDED_USERS.map((u) => (
              <button
                key={u.email}
                type="button"
                onClick={() => handleLogin(u.email)}
                className="dv-btn dv-btn-sm"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                {u.email.split('@')[0]}
                <span className="dv-mono" style={{ fontSize: '9px', letterSpacing: '0.5px', opacity: 0.6 }}> {u.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 flex h-10 w-10 items-center justify-center border-2 border-border bg-background hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-card transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {theme === 'dark'
            ? <><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></>
            : <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></>
          }
        </svg>
      </button>
    </div>
  );
}
