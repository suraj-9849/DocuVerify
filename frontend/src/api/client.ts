import axios, { AxiosError } from 'axios';
import type { ApiErrorShape } from '@/types';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export class ApiError extends Error {
  code: string;
  status?: number;
  details?: unknown;

  constructor(message: string, code: string, status?: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorShape>) => {
    const payload = error.response?.data?.error;
    return Promise.reject(
      new ApiError(
        payload?.message ?? error.message ?? 'Something went wrong',
        payload?.code ?? 'UNKNOWN_ERROR',
        error.response?.status,
        payload?.details,
      ),
    );
  },
);
