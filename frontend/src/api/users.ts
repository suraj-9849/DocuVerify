import { apiClient } from './client';
import type { PublicUser, Role } from '@/types';

export const usersApi = {
  async list() {
    const { data } = await apiClient.get<{ data: PublicUser[] }>('/users');
    return data.data;
  },

  async create(input: { email: string; name: string; role: Role }) {
    const { data } = await apiClient.post<{ data: PublicUser }>('/users', input);
    return data.data;
  },

  async updateRole(id: string, role: Role) {
    const { data } = await apiClient.patch<{ data: PublicUser }>(`/users/${id}/role`, { role });
    return data.data;
  },

  async delete(id: string) {
    await apiClient.delete(`/users/${id}`);
  },
};
