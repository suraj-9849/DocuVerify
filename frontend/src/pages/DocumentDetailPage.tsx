import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useDocument } from '@/hooks/useDocument';
import { useAuth } from '@/hooks/useAuth';
import { StatusBadge } from '@/components/document/StatusBadge';
import { AuditTimeline } from '@/components/document/AuditTimeline';
import { TransitionActions } from '@/components/document/TransitionActions';
import { DocumentForm, type DocumentFormValues } from '@/components/document/DocumentForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { formatDateTime } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { document, history, isLoading, error, submit, approve, reject, reopen, publish, archive, update } =
    useDocument(id);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (error || !document) {
    return <p className="text-sm text-destructive">{error ?? 'Document not found'}</p>;
  }

  const isOwner = user?.id === document.authorId;
  const isEditable = isOwner && (document.status === 'DRAFT' || document.status === 'REJECTED');

  async function handleUpdate(values: DocumentFormValues) {
    setIsSaving(true);
    const result = await update(values.title, values.body, document!.version);
    setIsSaving(false);
    if (!result.ok) {
      toast.error(result.message ?? 'Failed to save');
    } else {
      toast.success('Document updated');
      setIsEditing(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm font-semibold border-2 border-border px-3 py-1.5 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-card transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{document.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              By {document.author.name} · Last updated {formatDateTime(document.updatedAt)}
            </p>
          </div>
          <StatusBadge status={document.status} />
        </div>
      </div>

      <TransitionActions
        document={document}
        actions={{ submit, approve, reject, reopen, publish, archive }}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Content</CardTitle>
          {isEditable && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Edit
            </button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <DocumentForm
              defaultValues={{ title: document.title, body: document.body }}
              onSubmit={handleUpdate}
              isSubmitting={isSaving}
              submitLabel="Save changes"
            />
          ) : (
            <div className="prose prose-sm max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: document.body }} />
          )}
        </CardContent>
      </Card>

      <Separator />

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="history">
          <AuditTimeline events={history} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
