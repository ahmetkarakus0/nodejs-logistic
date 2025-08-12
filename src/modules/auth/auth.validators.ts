import { z } from 'zod';
import { EUserRole } from './auth.types';

export const registerSchema = z.object({
  name: z
    .string({
      error: 'Name is required',
    })
    .min(2, {
      error: 'Name must be at least 2 characters',
    }),
  surname: z
    .string({
      error: 'Surname is required',
    })
    .min(2, {
      error: 'Surname must be at least 2 characters',
    }),
  phone: z
    .string({
      error: 'Phone is required',
    })
    .regex(/^\+?\d{10,15}$/, {
      error: 'Invalid phone number',
    }),
  role: z.enum(Object.values(EUserRole), {
    error: 'Role is required',
  }),
  password: z
    .string({
      error: 'Password is required',
    })
    .min(6, {
      error: 'Password must be at least 6 characters',
    }),
});

export const loginSchema = z.object({
  phone: z
    .string({
      error: 'Phone is required',
    })
    .regex(/^\+?\d{10,15}$/, {
      error: 'Invalid phone number',
    }),
  password: z
    .string({
      error: 'Password is required',
    })
    .min(6, {
      error: 'Password must be at least 6 characters',
    }),
});

export const verifyTwoFactorCodeSchema = z.object({
  code: z.string({
    error: 'Code is required',
  }),
});

export const sendResetPasswordLinkSchema = z.object({
  phone: z
    .string({
      error: 'Phone is required',
    })
    .regex(/^\+?\d{10,15}$/, {
      error: 'Invalid phone number',
    }),
});

export const resetPasswordSchema = z.object({
  phone: z
    .string({
      error: 'Phone is required',
    })
    .regex(/^\+?\d{10,15}$/, {
      error: 'Invalid phone number',
    }),
  token: z.string({
    error: 'Token is required',
  }),
  newPassword: z
    .string({
      error: 'New password is required',
    })
    .min(6, {
      error: 'New password must be at least 6 characters',
    }),
});
