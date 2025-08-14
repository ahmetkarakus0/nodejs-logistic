import { z } from 'zod';
import { ECustomerLocationType } from '@/modules/customer-locations/customer-locations.types';

export const createCustomerLocationSchema = z
  .object({
    customer_id: z.string({
      error: 'Customer ID is required',
    }),
    label: z
      .string({
        error: 'Label is required',
      })
      .min(1, {
        message: 'Label is required',
      }),
    address_line_1: z
      .string({
        error: 'Address line 1 is required',
      })
      .min(1, {
        message: 'Address line 1 is required',
      }),
    address_line_2: z.string().optional(),
    city: z
      .string({
        error: 'City is required',
      })
      .min(1, {
        message: 'City is required',
      }),
    state: z.string().optional(),
    postal_code: z
      .string({
        error: 'Postal code is required',
      })
      .min(1, {
        message: 'Postal code is required',
      }),
    country: z
      .string({
        error: 'Country is required',
      })
      .min(1, {
        message: 'Country is required',
      }),
    latitude: z
      .number({
        error: 'Latitude is required',
      })
      .min(1, {
        message: 'Latitude is required',
      }),
    longitude: z
      .number({
        error: 'Longitude is required',
      })
      .min(1, {
        message: 'Longitude is required',
      }),
    type: z.enum(Object.values(ECustomerLocationType), {
      error: `Type is required: ${Object.values(ECustomerLocationType).join(', ')}`,
    }),
    is_primary: z.boolean().optional(),
    notes: z.string().optional(),
  })
  .strip();

export const updateCustomerLocationSchema = createCustomerLocationSchema
  .partial()
  .strip();
