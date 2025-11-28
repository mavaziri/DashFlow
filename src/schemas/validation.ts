import { z } from 'zod';

export const userRegistrationSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name must contain only letters'),

  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name must contain only letters'),

  email: z.string().email('Please enter a valid email address').toLowerCase(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  mobileNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid mobile number')
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number must not exceed 15 digits'),

  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must not exceed 200 characters'),
});

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .refine((value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const mobileRegex = /^\+?[1-9]\d{1,14}$/;

      return emailRegex.test(value) || mobileRegex.test(value);
    }, 'Username must be a valid email address or mobile number'),

  password: z.string().min(1, 'Password is required'),
});

import { OrderStatus, SortOrder } from '@/types';

export const orderSearchSchema = z.object({
  query: z.string().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  buyerName: z.string().optional(),
  orderNumber: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z
    .enum(['orderDate', 'orderNumber', 'buyerName', 'status'])
    .optional(),
  sortOrder: z.nativeEnum(SortOrder).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export type UserRegistrationFormData = z.infer<typeof userRegistrationSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type OrderSearchFormData = z.infer<typeof orderSearchSchema>;
