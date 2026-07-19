import { useCallback, useEffect, useState } from 'react';
import { documentsApi } from '@/api/documents';
import { ApiError } from '@/api/client';
import type { AuditEvent, Document } from '@/types';

export function useDocument(id: string | undefined) {
  const [document, setDocument] = useState<Document | null>(null);
  const [history, setHistory] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [doc, events] = await Promise.all([
        documentsApi.getById(id),
        documentsApi.getHistory(id),
      ]);
      setDocument(doc);
      setHistory(events);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load document');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const runAction = useCallback(
    async (action: () => Promise<Document>) => {
      try {
        const updated = await action();
        setDocument(updated);
        await fetchAll();
        return { ok: true as const };
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.code === 'STALE_WRITE') {
            await fetchAll();
          }
          return { ok: false as const, message: err.message, code: err.code };
        }
        throw err;
      }
    },
    [fetchAll],
  );

  return {
    document,
    history,
    isLoading,
    error,
    refetch: fetchAll,
    submit: (version: number) => runAction(() => documentsApi.submit(id!, version)),
    approve: (version: number) => runAction(() => documentsApi.approve(id!, version)),
    reject: (version: number, comment: string) =>
      runAction(() => documentsApi.reject(id!, version, comment)),
    reopen: (version: number) => runAction(() => documentsApi.reopen(id!, version)),
    publish: (version: number) => runAction(() => documentsApi.publish(id!, version)),
    archive: (version: number) => runAction(() => documentsApi.archive(id!, version)),
    update: (title: string, body: string, version: number) =>
      runAction(() => documentsApi.update(id!, { title, body, version })),
  };
}
