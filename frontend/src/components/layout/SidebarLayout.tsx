import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SidebarLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:hidden',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar />
      </div>

      <main className="flex-1 min-w-0 overflow-auto">
        <div className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b-2 border-border bg-background px-4 lg:hidden">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center border-2 border-border hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-card transition-all"
          >
            <Menu className="h-4 w-4" />
          </button>
          <span className="font-bold dv-mono text-sm" style={{ letterSpacing: '1px' }}>DocuVerify</span>
        </div>
        <div className="container py-4 sm:py-8 page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
