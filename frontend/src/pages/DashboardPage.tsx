import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentCard } from '@/components/document/DocumentCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DocumentStatus } from '@/types';
import { Inbox, Filter, X } from 'lucide-react';

const STATUS_OPTIONS: DocumentStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'PUBLISHED',
  'ARCHIVED',
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<DocumentStatus | 'ALL'>('ALL');
  const [scope, setScope] = useState<'all' | 'mine'>('all');

  const { documents, isLoading, error } = useDocuments({
    status: status === 'ALL' ? undefined : status,
    mine: scope === 'mine',
  });

  const hasActiveFilter = status !== 'ALL' || scope !== 'all';

  const activeDocs = documents.filter((d) =>
    ['DRAFT', 'SUBMITTED', 'REJECTED'].includes(d.status)
  );
  const completedDocs = documents.filter((d) =>
    ['APPROVED', 'PUBLISHED'].includes(d.status)
  );
  const archivedDocs = documents.filter((d) => d.status === 'ARCHIVED');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.role === 'VIEWER'
              ? 'Published documents'
              : user?.role === 'REVIEWER'
                ? 'Review queue and tracked documents'
                : 'Documents you can see, based on your role'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {user?.role !== 'VIEWER' && (
            <Tabs value={scope} onValueChange={(v) => setScope(v as 'all' | 'mine')}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="mine">Mine</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <Select value={status} onValueChange={(v) => setStatus(v as DocumentStatus | 'ALL')}>
            <SelectTrigger className="w-[140px] sm:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilter && !isLoading && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-2 border-border bg-muted dv-mono" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
          <Filter className="h-3.5 w-3.5 shrink-0" />
          <span className="font-semibold">Filtered:</span>
          {scope === 'mine' && (
            <span className="font-bold" style={{ color: 'var(--correct)' }}>Mine</span>
          )}
          {scope === 'mine' && status !== 'ALL' && <span>·</span>}
          {status !== 'ALL' && (
            <span className="font-bold" style={{ color: 'var(--correct)' }}>
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </span>
          )}
          <span className="text-muted-foreground">
            — {documents.length} document{documents.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => { setStatus('ALL'); setScope('all'); }}
            className="ml-auto flex items-center gap-1 text-xs font-bold underline hover:no-underline"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        </div>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      )}

      {error && (
        <div className="border-2 p-4 font-semibold" style={{ borderColor: 'var(--wrong)', color: 'var(--wrong)' }}>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!isLoading && !error && documents.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <div className="flex h-12 w-12 items-center justify-center border-2 border-border bg-muted">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-semibold">No documents to show here yet.</p>
          <p className="text-sm text-muted-foreground">Try changing your filter or create a new document.</p>
        </div>
      )}

      {!isLoading && documents.length > 0 && (
        <div className="space-y-8">
          <div>
            {activeDocs.length > 0 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activeDocs.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
                </div>
              </>
            )}

            {completedDocs.length > 0 && (
              <>
                {(activeDocs.length > 0) && <hr className="border-t border-border my-6" />}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {completedDocs.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
                </div>
              </>
            )}

            {archivedDocs.length > 0 && (
              <>
                {(activeDocs.length > 0 || completedDocs.length > 0) && <hr className="border-t border-border my-6" />}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {archivedDocs.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
