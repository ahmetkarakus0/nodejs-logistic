import { createPool } from '../../database';
import {
  IRefreshToken,
  IResetPasswordToken,
  ITwoFactorCode,
  IUser,
} from './auth.types';

export const insertUser = async (
  user: Omit<IUser, 'id' | 'created_at' | 'updated_at'>,
): RepoPromise<IUser> => {
  const { name, surname, phone, role, password } = user;
  const pool = await createPool();
  const query = `
          INSERT INTO users (name, surname, phone, role, password)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;

  const result = await pool.query(query, [
    name,
    surname,
    phone,
    role,
    password,
  ]);
  return result.rows[0] as IUser;
};

export const getUserByPhone = async (phone: string): RepoPromise<IUser> => {
  const pool = await createPool();
  const query = `SELECT * FROM users WHERE phone = $1`;
  const result = await pool.query(query, [phone]);
  return result.rows[0] as IUser;
};

export const getUserById = async (id: string): RepoPromise<IUser> => {
  const pool = await createPool();
  const query = `SELECT * FROM users WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0] as IUser;
};

export const markTwoFactorCodeAsUsed = async (
  code: string,
  userId: string,
): RepoPromise<boolean> => {
  const pool = await createPool();
  const query = `UPDATE two_factor_codes SET is_used = true WHERE code = $1 AND user_id = $2`;
  await pool.query(query, [code, userId]);
  return true;
};

export const insertTwoFactorCode = async (
  code: string,
  expiresAt: Date,
  userId: string,
): RepoPromise<ITwoFactorCode> => {
  const pool = await createPool();
  const query = `INSERT INTO two_factor_codes (code, expires_at, user_id) VALUES ($1, $2, $3) RETURNING *`;
  const result = await pool.query(query, [code, expiresAt, userId]);
  return result.rows[0] as ITwoFactorCode;
};

export const getValidTwoFactorCodeByCodeAndUserId = async (
  code: string,
  userId: string,
) => {
  const pool = await createPool();
  const query = `SELECT * FROM two_factor_codes WHERE code = $1 AND user_id = $2 AND is_used = false AND expires_at > NOW()`;
  const result = await pool.query(query, [code, userId]);
  return result.rows[0] as ITwoFactorCode;
};

export const insertResetPasswordToken = async (
  token: string,
  phone: string,
  expiresAt: Date,
) => {
  const pool = await createPool();
  const query = `INSERT INTO reset_password_tokens (token, phone, expires_at) VALUES ($1, $2, $3) RETURNING *`;
  const result = await pool.query(query, [token, phone, expiresAt]);
  return result.rows[0] as IResetPasswordToken;
};

export const getValidResetPasswordTokenByTokenAndPhone = async (
  token: string,
  phone: string,
) => {
  const pool = await createPool();
  const query = `SELECT * FROM reset_password_tokens WHERE token = $1 AND phone = $2 AND expires_at > NOW() AND is_used = false`;
  const result = await pool.query(query, [token, phone]);
  return result.rows[0] as IResetPasswordToken;
};

export const markResetPasswordTokenAsUsed = async (
  token: string,
  phone: string,
) => {
  const pool = await createPool();
  const query = `UPDATE reset_password_tokens SET is_used = true WHERE token = $1 AND phone = $2`;
  await pool.query(query, [token, phone]);
  return true;
};

export const updateUserPassword = async (userId: string, password: string) => {
  const pool = await createPool();
  const query = `UPDATE users SET password = $1 WHERE id = $2`;
  await pool.query(query, [password, userId]);
  return true;
};

export const insertRefreshToken = async (
  userId: string,
  hash: string,
  expiresAt: Date,
) => {
  const pool = await createPool();
  const query = `INSERT INTO refresh_tokens (user_id, hash, expires_at) VALUES ($1, $2, $3) RETURNING *`;
  const result = await pool.query(query, [userId, hash, expiresAt]);
  return result.rows[0] as IRefreshToken;
};

export const getValidRefreshTokenByHash = async (hash: string) => {
  const pool = await createPool();
  const query = `SELECT * FROM refresh_tokens WHERE hash = $1 AND expires_at > NOW() AND revoked = false`;
  const result = await pool.query(query, [hash]);
  return result.rows[0] as IRefreshToken;
};

export const revokeRefreshToken = async (id: string) => {
  const pool = await createPool();
  const query = `UPDATE refresh_tokens SET revoked = true WHERE id = $1`;
  await pool.query(query, [id]);
  return true;
};
