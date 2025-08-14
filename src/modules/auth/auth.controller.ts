import { Request, Response } from 'express';
import {
  createUserService,
  logoutService,
  refreshTokenService,
  resetPasswordService,
  sendResetPasswordLinkService,
  twoFactorAuthService,
  verifyTwoFactorCodeService,
} from '@/modules/auth/auth.service';

/**
 * @route POST /auth/register
 */
export const registerUser = async (req: Request, res: Response) => {
  const user = await createUserService(req.body);
  res.status(201).json(user);
};

/**
 * @route POST /auth/two-factor-auth
 */
export const twoFactorAuth = async (req: Request, res: Response) => {
  const user = await twoFactorAuthService(req.body);
  res.status(200).json(user);
};

/**
 * @route POST /auth/verify-two-factor-code
 */
export const verifyTwoFactorCode = async (req: Request, res: Response) => {
  const tempToken = req.headers['temptoken'] as string;
  const code = req.body.code;
  const data = await verifyTwoFactorCodeService(tempToken, code);
  res.status(200).json(data);
};

/**
 * @route POST /auth/refresh-token
 */
export const refreshToken = async (req: Request, res: Response) => {
  const token = req.headers['refreshtoken'] as string;
  const data = await refreshTokenService(token);
  res.status(200).json(data);
};

/**
 * @route POST /auth/send-reset-password-link
 */
export const sendResetPasswordLink = async (req: Request, res: Response) => {
  const data = await sendResetPasswordLinkService(req.body.phone);
  res.status(200).json(data);
};

/**
 * @route POST /auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response) => {
  const { phone, token, newPassword } = req.body;
  const data = await resetPasswordService(phone, token, newPassword);
  res.status(200).json(data);
};

/**
 * @route POST /auth/logout
 */
export const logout = async (req: Request, res: Response) => {
  const token = req.headers['refreshtoken'] as string;
  const data = await logoutService(token);
  res.status(200).json(data);
};
