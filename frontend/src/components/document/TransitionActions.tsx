import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import type { Document } from '@/types';
import type { useDocument } from '@/hooks/useDocument';

type Actions = ReturnType<typeof useDocument>;

interface TransitionActionsProps {
  document: Document;
  actions: Pick<Actions, 'submit' | 'approve' | 'reject' | 'reopen' | 'publish' | 'archive'>;
}

// The buttons rendered here are purely a convenience — every one of them
// calls a server endpoint that re-checks role, ownership, and current state
// independently. Hiding a button is not the permission check; the service
// layer is.
export function TransitionActions({ document, actions }: TransitionActionsProps) {
  const { user } = useAuth();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [pending, setPending] = useState<string | null>(null);

  if (!user) return null;

  const isOwner = user.id === document.authorId;
  const canReview = user.role === 'REVIEWER' || user.role === 'ADMIN';

  async function run(label: string, fn: () => Promise<{ ok: boolean; message?: string }>) {
    setPending(label);
    const result = await fn();
    setPending(null);
    if (!result.ok) {
      toast.error(result.message ?? 'Action failed');
    } else {
      toast.success(`Document ${label}`);
    }
  }

  const buttons: React.ReactNode[] = [];

  if (isOwner && document.status === 'DRAFT') {
    buttons.push(
      <Button
        key="submit"
        isLoading={pending === 'submitted'}
        onClick={() => run('submitted', () => actions.submit(document.version))}
      >
        Submit for review
      </Button>,
    );
  }

  if (isOwner && document.status === 'REJECTED') {
    buttons.push(
      <Button
        key="reopen"
        variant="secondary"
        isLoading={pending === 'reopened'}
        onClick={() => run('reopened', () => actions.reopen(document.version))}
      >
        Reopen to edit
      </Button>,
    );
  }

  if (canReview && !isOwner && document.status === 'SUBMITTED') {
    buttons.push(
      <Button
        key="approve"
        isLoading={pending === 'approved'}
        onClick={() => run('approved', () => actions.approve(document.version))}
      >
        Approve
      </Button>,
      <Button key="reject" variant="destructive" onClick={() => setRejectOpen(true)}>
        Reject
      </Button>,
    );
  }

  if (canReview && document.status === 'APPROVED') {
    buttons.push(
      <Button
        key="publish"
        isLoading={pending === 'published'}
        onClick={() => run('published', () => actions.publish(document.version))}
      >
        Publish
      </Button>,
    );
  }

  if (
    user.role === 'ADMIN' &&
    document.status !== 'ARCHIVED'
  ) {
    buttons.push(
      <Button
        key="archive"
        variant="outline"
        isLoading={pending === 'archived'}
        onClick={() => run('archived', () => actions.archive(document.version))}
      >
        Archive
      </Button>,
    );
  }

  if (buttons.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2">{buttons}</div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject document</DialogTitle>
            <DialogDescription>
              A comment is required so the author knows what to fix before resubmitting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-comment">Comment</Label>
            <Textarea
              id="reject-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Explain what needs to change..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={comment.trim().length === 0}
              isLoading={pending === 'rejected'}
              onClick={async () => {
                setPending('rejected');
                const result = await actions.reject(document.version, comment.trim());
                setPending(null);
                if (!result.ok) {
                  toast.error(result.message ?? 'Failed to reject');
                } else {
                  toast.success('Document rejected');
                  setRejectOpen(false);
                  setComment('');
                }
              }}
            >
              Confirm rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
