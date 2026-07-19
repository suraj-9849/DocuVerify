import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { usersApi } from '@/api/users';
import { Button } from '@/components/ui/button';
import type { PublicUser, Role } from '@/types';
import { Trash2, UserPlus } from 'lucide-react';

const ALL_ROLES: Role[] = ['VIEWER', 'AUTHOR', 'REVIEWER', 'ADMIN'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('REVIEWER');
  const [isCreating, setIsCreating] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await usersApi.list();
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsCreating(true);
    try {
      const user = await usersApi.create({ name: newName, email: newEmail, role: newRole });
      setUsers((prev) => [user, ...prev]);
      setShowForm(false);
      setNewName('');
      setNewEmail('');
      setNewRole('REVIEWER');
      toast.success(`User ${user.name} created`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create user';
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRoleChange(id: string, role: Role) {
    try {
      const updated = await usersApi.updateRole(id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success(`Role updated to ${role}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update role';
      toast.error(msg);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await usersApi.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success(`User ${name} deleted`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete user';
      toast.error(msg);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage users and their roles</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <UserPlus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Add user'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="border-2 border-border p-4 space-y-3 bg-muted">
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <label className="dv-mono block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="dv-input w-full text-sm px-3 py-2 border-2 border-border bg-background"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="dv-mono block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="dv-input w-full text-sm px-3 py-2 border-2 border-border bg-background"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="dv-mono block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="w-full text-sm px-3 py-2 border-2 border-border bg-background"
              >
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" isLoading={isCreating} className="w-full">Create</Button>
            </div>
          </div>
        </form>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Loading users...</p>}

      {!isLoading && (
        <div className="border-2 border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border bg-muted text-left">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-semibold">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                      className="text-sm px-2 py-1 border-2 border-border bg-background"
                    >
                      {ALL_ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground dv-mono text-xs">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      className="flex h-8 w-8 items-center justify-center border-2 border-transparent hover:border-wrong hover:text-wrong transition-all ml-auto"
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
