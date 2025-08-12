import { z } from 'zod';

export const createCustomerSchema = z.object({
  company_name: z.string().min(1, {
    error: 'Company name is required',
  }),
  user_id: z.uuid({
    error: 'User ID is required',
  }),
  email: z.email({
    error: 'Email is required',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  }),
  billing_info: z.object({
    billing_address: z.object(
      {
        street: z.string().min(1, {
          error: 'Street is required',
        }),
        city: z.string().min(1, {
          error: 'City is required',
        }),
        postal_code: z.string().min(1, {
          error: 'Postal code is required',
        }),
        country: z.string().min(1, {
          error: 'Country is required',
        }),
      },
      {
        error: 'Billing address is required',
      },
    ),
    tax_id: z.string().min(1, {
      error: 'Tax ID is required',
    }),
    payment_method: z
      .string({
        error: 'Payment method is required',
      })
      .min(1, {
        error: 'Payment method is required',
      }),
    contacts: z.array(
      z.object({
        name: z.string().min(1, {
          error: 'Name is required',
        }),
        email: z.email({
          error: 'Contact email is required',
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        }),
        phone: z.string().min(1, {
          error: 'Phone is required',
        }),
      }),
      {
        error: 'Contacts must be an array',
      },
    ),
  }),
});

export const updateCustomerSchema = createCustomerSchema.partial();
