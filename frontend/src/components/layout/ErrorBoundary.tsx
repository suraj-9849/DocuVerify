import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
}

// A class component is required here — React only recognizes
// getDerivedStateFromError / componentDidCatch on class components, there is
// no hook equivalent. This is the last line of defense: if a page throws
// during render, the whole app should not go blank.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught error in UI tree:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-6">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <div>
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
          </div>
          <Button onClick={() => window.location.assign('/')}>Go back home</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
