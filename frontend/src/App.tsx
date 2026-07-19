import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppRouter } from '@/routes';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { SmoothScroll } from '@/components/layout/SmoothScroll';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SmoothScroll>
            <AppRouter />
          </SmoothScroll>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--card)',
                color: 'var(--foreground)',
                border: '2px solid var(--border)',
                borderRadius: 0,
                boxShadow: '4px 4px 0px var(--border)',
                fontSize: '13px',
                fontFamily: 'inherit',
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
