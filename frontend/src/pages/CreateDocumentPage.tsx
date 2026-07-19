import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { documentsApi } from '@/api/documents';
import { ApiError } from '@/api/client';
import { DocumentForm, type DocumentFormValues } from '@/components/document/DocumentForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export default function CreateDocumentPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(values: DocumentFormValues) {
    setIsSubmitting(true);
    try {
      const doc = await documentsApi.create(values);
      toast.success('Draft created');
      navigate(`/documents/${doc.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create document');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>New document</CardTitle>
          <CardDescription>Starts as a draft. Only you can see and edit it until submitted.</CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentForm onSubmit={handleCreate} isSubmitting={isSubmitting} submitLabel="Create draft" />
        </CardContent>
      </Card>
    </div>
  );
}
