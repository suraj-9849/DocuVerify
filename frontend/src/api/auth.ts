import { apiClient } from './client';
import type { PublicUser } from '@/types';

export const authApi = {
  async login(email: string) {
    const { data } = await apiClient.post<{ data: PublicUser }>('/auth/login', { email });
    return data.data;
  },

  async logout() {
    await apiClient.post('/auth/logout');
  },

  async me() {
    const { data } = await apiClient.get<{ data: PublicUser }>('/auth/me');
    return data.data;
  },
};
