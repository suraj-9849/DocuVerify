import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
});

export type LoginInput = z.infer<typeof loginSchema>;
