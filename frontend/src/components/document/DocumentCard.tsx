import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { formatDateTime } from '@/lib/utils';
import type { Document } from '@/types';

export function DocumentCard({ document }: { document: Document }) {
  return (
    <Link to={`/documents/${document.id}`} className="block dv-hover-lift">
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1 text-base">{document.title}</CardTitle>
            <StatusBadge status={document.status} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: document.body }} />
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">By {document.author.name}</span>
            <span className="shrink-0 ml-2">{formatDateTime(document.updatedAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
