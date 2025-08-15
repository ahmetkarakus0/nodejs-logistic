import { z } from 'zod';
import { EDriverStatus } from './drivers.types';

export const createDriverSchema = z
  .object({
    user_id: z.uuid({
      error: 'User ID is required',
    }),
    license_number: z.string().min(1, {
      error: 'License number is required',
    }),
    license_expiry_date: z.string().min(1, {
      error: 'License expiry date is required',
    }),
    date_of_birth: z.string().min(1, {
      error: 'Date of birth is required',
    }),
    address: z.string().min(1, {
      error: 'Address is required',
    }),
    emergency_contact_name: z.string().min(1, {
      error: 'Emergency contact name is required',
    }),
    emergency_contact_phone: z.string().min(1, {
      error: 'Emergency contact phone is required',
    }),
    employment_start_date: z.string().min(1, {
      error: 'Employment start date is required',
    }),
    employment_end_date: z.string().optional(),
    status: z.enum(Object.values(EDriverStatus), {
      error: `Status is required: ${Object.values(EDriverStatus).join(', ')}`,
    }),
    notes: z.string().optional(),
  })
  .strip();

export const updateDriverSchema = createDriverSchema.partial();
