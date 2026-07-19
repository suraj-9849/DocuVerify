import { apiClient } from './client';
import type { AuditEvent, Document, DocumentStatus } from '@/types';

interface ListParams {
  status?: DocumentStatus;
  mine?: boolean;
}

export const documentsApi = {
  async list(params: ListParams = {}) {
    const { data } = await apiClient.get<{ data: Document[] }>('/documents', { params });
    return data.data;
  },

  async getById(id: string) {
    const { data } = await apiClient.get<{ data: Document }>(`/documents/${id}`);
    return data.data;
  },

  async getHistory(id: string) {
    const { data } = await apiClient.get<{ data: AuditEvent[] }>(`/documents/${id}/history`);
    return data.data;
  },

  async create(input: { title: string; body: string }) {
    const { data } = await apiClient.post<{ data: Document }>('/documents', input);
    return data.data;
  },

  async update(id: string, input: { title: string; body: string; version: number }) {
    const { data } = await apiClient.patch<{ data: Document }>(`/documents/${id}`, input);
    return data.data;
  },

  async submit(id: string, version: number) {
    const { data } = await apiClient.post<{ data: Document }>(`/documents/${id}/submit`, { version });
    return data.data;
  },

  async approve(id: string, version: number) {
    const { data } = await apiClient.post<{ data: Document }>(`/documents/${id}/approve`, { version });
    return data.data;
  },

  async reject(id: string, version: number, comment: string) {
    const { data } = await apiClient.post<{ data: Document }>(`/documents/${id}/reject`, {
      version,
      comment,
    });
    return data.data;
  },

  async reopen(id: string, version: number) {
    const { data } = await apiClient.post<{ data: Document }>(`/documents/${id}/reopen`, { version });
    return data.data;
  },

  async publish(id: string, version: number) {
    const { data } = await apiClient.post<{ data: Document }>(`/documents/${id}/publish`, { version });
    return data.data;
  },

  async archive(id: string, version: number) {
    const { data } = await apiClient.post<{ data: Document }>(`/documents/${id}/archive`, { version });
    return data.data;
  },
};
