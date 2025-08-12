import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async-handler';
import { validate } from '../../middlewares/validate';
import {
  logout,
  refreshToken,
  registerUser,
  resetPassword,
  sendResetPasswordLink,
  twoFactorAuth,
  verifyTwoFactorCode,
} from './auth.controller';
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  sendResetPasswordLinkSchema,
  verifyTwoFactorCodeSchema,
} from './auth.validators';
import { authMiddleware } from '../../middlewares/auth';

const authRoutes = Router();

/**
 * @description Register a new user and return access & refresh token
 */
authRoutes.post(
  '/register',
  validate(registerSchema),
  asyncHandler(registerUser),
);

/**
 * @description Two factor authentication
 */
authRoutes.post(
  '/two-factor-auth',
  validate(loginSchema),
  asyncHandler(twoFactorAuth),
);

/**
 * @description Verify two factor code
 */
authRoutes.post(
  '/verify-two-factor-code',
  validate(verifyTwoFactorCodeSchema),
  asyncHandler(verifyTwoFactorCode),
);

/**
 * @description Refresh token
 */
authRoutes.get('/refresh-token', authMiddleware, asyncHandler(refreshToken));

/**
 * @description Send reset password link
 */
authRoutes.post(
  '/send-reset-password-link',
  validate(sendResetPasswordLinkSchema),
  asyncHandler(sendResetPasswordLink),
);

/**
 * @description Reset password
 */
authRoutes.post(
  '/reset-password',
  validate(resetPasswordSchema),
  asyncHandler(resetPassword),
);

/**
 * @description Logout
 */
authRoutes.get('/logout', authMiddleware, asyncHandler(logout));

export default authRoutes;
