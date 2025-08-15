export enum EDriverStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface IDriver {
  id: string;
  user_id: string;
  license_number: string;
  license_expiry_date: Date;
  date_of_birth: Date;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  employment_start_date: Date;
  employment_end_date: Date | null;
  status: EDriverStatus;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface GetDriversFilters
  extends Partial<{
    userId: string;
    licenseNumber: string;
    licenseExpiryDate: string;
    dateOfBirth: string;
    address: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    employmentStartDate: string;
    employmentEndDate: string;
    status: EDriverStatus;
    notes: string;
  }> {}
