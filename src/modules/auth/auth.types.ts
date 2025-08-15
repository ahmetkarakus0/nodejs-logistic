export enum EUserRole {
  ADMIN = 'admin',
  DRIVER = 'driver',
  CUSTOMER = 'customer',
}

export interface IUserWithTempToken {
  user: Omit<IUser, 'id' | 'password' | 'created_at' | 'updated_at'>;
  tempToken: string;
  message: string;
}

export interface IWithTokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface IUserWithTokens extends IWithTokenData {
  user: Omit<IUser, 'id' | 'password' | 'created_at' | 'updated_at'>;
}

export interface IUser {
  id: string;
  name: string;
  surname: string;
  phone: string;
  role: EUserRole;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface ITwoFactorCode {
  id: string;
  code: string;
  expires_at: Date;
  user_id: string;
  is_used: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IResetPasswordToken {
  id: string;
  token: string;
  phone: string;
  expires_at: Date;
  is_used: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ISendResetPasswordLinkResponse {
  message: string;
  expiresAt: Date;
}

export interface IRefreshToken {
  id: string;
  user_id: string;
  hash: string;
  expires_at: Date;
  revoked: boolean;
  created_at: Date;
  updated_at: Date;
}
