import { useCallback, useEffect, useState } from 'react';
import { documentsApi } from '@/api/documents';
import { ApiError } from '@/api/client';
import type { Document, DocumentStatus } from '@/types';

interface UseDocumentsOptions {
  status?: DocumentStatus;
  mine?: boolean;
}

export function useDocuments(options: UseDocumentsOptions = {}) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await documentsApi.list(options);
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.status, options.mine]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { documents, isLoading, error, refetch: fetchDocuments };
}
