import { Badge } from '@/components/ui/badge';
import type { DocumentStatus } from '@/types';

const STATUS_STYLES: Record<DocumentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' }> = {
  DRAFT: { label: 'Draft', variant: 'secondary' },
  SUBMITTED: { label: 'Submitted', variant: 'info' },
  APPROVED: { label: 'Approved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  PUBLISHED: { label: 'Published', variant: 'default' },
  ARCHIVED: { label: 'Archived', variant: 'outline' },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const s = STATUS_STYLES[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
