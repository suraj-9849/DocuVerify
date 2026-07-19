import { formatDateTime } from '@/lib/utils';
import type { AuditEvent } from '@/types';
import { Badge } from '@/components/ui/badge';

const ACTION_LABEL: Record<AuditEvent['action'], string> = {
  CREATED: 'created the document',
  EDITED: 'edited the document',
  SUBMITTED: 'submitted for review',
  APPROVED: 'approved the document',
  REJECTED: 'rejected the document',
  REOPENED: 'reopened the document',
  PUBLISHED: 'published the document',
  ARCHIVED: 'archived the document',
};

export function AuditTimeline({ events }: { events: AuditEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No history yet.</p>;
  }

  return (
    <ol className="relative border-l border-border pl-6 space-y-6">
      {events.map((event) => (
        <li key={event.id} className="relative">
          <span className="absolute -left-[29px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{event.actor.name}</span>
            <span className="text-sm text-muted-foreground">{ACTION_LABEL[event.action]}</span>
            <Badge variant="outline" className="text-[10px]">
              {event.actor.role}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(event.createdAt)}</p>
          {event.comment && (
            <p className="mt-1.5 rounded-md bg-muted px-3 py-2 text-sm">&ldquo;{event.comment}&rdquo;</p>
          )}
          {event.prevStatus && event.newStatus && (
            <p className="mt-1 text-xs text-muted-foreground">
              {event.prevStatus} → {event.newStatus}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
