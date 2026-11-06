import { z } from 'zod';

const email = z.string({ required_error: 'Email is required' }).trim().toLowerCase().email('Invalid email address');

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(60, 'Full name is too long'),
    email,
    password: z
      .string()
      .min(8, 'Use at least 8 characters')
      .max(72, 'Password is too long')
      .regex(/\d/, 'Password must include a number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const loginSchema = z.object({
  email,
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});
