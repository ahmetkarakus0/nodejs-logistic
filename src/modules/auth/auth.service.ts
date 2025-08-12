import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from '../../errors/http-error';
import { createResetPasswordToken } from '../../utils/create-reset-password-token';
import { createTwoFactorCode } from '../../utils/create-two-factor-code';
import { toPublicUser } from './auth.helpers';
import {
  getUserById,
  getUserByPhone,
  getValidRefreshTokenByHash,
  getValidResetPasswordTokenByTokenAndPhone,
  getValidTwoFactorCodeByCodeAndUserId,
  insertRefreshToken,
  insertResetPasswordToken,
  insertTwoFactorCode,
  insertUser,
  markResetPasswordTokenAsUsed,
  markTwoFactorCodeAsUsed,
  revokeRefreshToken,
  updateUserPassword,
} from './auth.repository';
import {
  ISendResetPasswordLinkResponse,
  IUser,
  IUserWithTempToken,
  IUserWithTokens,
  IWithTokenData,
} from './auth.types';

/**
 * @param {IUser} user - The user object
 * @returns {object} The user object
 * @returns {string} The access token
 * @returns {string} The refresh token
 * @returns {number} The expires in
 */
export const createUserService = async (
  user: IUser,
): Promise<{ message: string }> => {
  const { name, surname, phone, role, password } = user;

  const foundUser = await getUserByPhone(phone);
  if (foundUser) {
    throw new BadRequestError('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await insertUser({
    name,
    surname,
    phone,
    role,
    password: hashedPassword,
  });

  if (!newUser) {
    throw new InternalServerError('Failed to create user');
  }

  return { message: 'User created successfully' };
};

/**
 * @param {Pick<IUser, 'phone' | 'password'>} user - The user object
 *
 * @returns {object} The user object
 * @returns {string} The temp token
 */
export const twoFactorAuthService = async (
  user: Pick<IUser, 'phone' | 'password'>,
): Promise<IUserWithTempToken> => {
  const { phone, password } = user;

  const foundUser = await getUserByPhone(phone);

  if (!foundUser) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, foundUser.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const { code, expiresAt } = await createTwoFactorCode();

  const newTwoFactorCode = await insertTwoFactorCode(
    code,
    expiresAt,
    foundUser.id,
  );

  if (!newTwoFactorCode) {
    throw new InternalServerError('Failed to create two factor code');
  }

  // TODO: Uncomment this when the SMS credentials are ready
  // const message = await sendMessage(
  //   phone,
  //   `Your code is ${newTwoFactorCode.code}. It will expire in ${expiresAt.getMinutes()} minutes.`,
  // );

  // if (!message) {
  //   throw new InternalServerError('Failed to send message');
  // }

  const tempToken = jwt.sign({ id: foundUser.id }, process.env.JWT_SECRET!, {
    expiresIn: '4m',
  });

  return {
    user: toPublicUser(foundUser),
    tempToken,
    message: 'Two factor code sent successfully',
    ...(process.env.NODE_ENV === 'development' && { code }),
  };
};

/**
 * @param {string} tempToken - The temp token
 *
 * @returns {IUserWithTokens} The user with tokens
 */
export const verifyTwoFactorCodeService = async (
  tempToken: string,
  code: string,
): Promise<IUserWithTokens> => {
  const decoded = jwt.verify(tempToken, process.env.JWT_SECRET!);

  if (typeof decoded === 'string') {
    throw new UnauthorizedError('Invalid temp token');
  }

  const { id } = decoded as { id: string };

  const foundTwoFactorCode = await getValidTwoFactorCodeByCodeAndUserId(
    code,
    id,
  );

  if (!foundTwoFactorCode) {
    throw new UnauthorizedError('Invalid code');
  }

  const foundUser = await getUserById(id);
  if (!foundUser) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isMarked = await markTwoFactorCodeAsUsed(code, id);
  if (!isMarked) {
    throw new UnauthorizedError('Invalid code');
  }

  const accessToken = jwt.sign({ id: foundUser.id }, process.env.JWT_SECRET!, {
    expiresIn: +process.env.JWT_EXPIRE!,
  });

  const refreshToken = jwt.sign({ id: foundUser.id }, process.env.JWT_SECRET!, {
    expiresIn: +process.env.JWT_REFRESH_EXPIRE!,
  });

  const hashedRefreshToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  const refreshTokenDB = await insertRefreshToken(
    foundUser.id,
    hashedRefreshToken,
    new Date(Date.now() + +process.env.JWT_REFRESH_EXPIRE! * 1000),
  );
  if (!refreshTokenDB) {
    throw new InternalServerError('Failed to store refresh token');
  }

  const expiresMs = Date.now() + +process.env.JWT_EXPIRE! * 1000;
  const expiresAt = new Date(expiresMs).toUTCString();

  const refreshTokenExpiresMs =
    Date.now() + +process.env.JWT_REFRESH_EXPIRE! * 1000;
  const refreshTokenExpiresAt = new Date(refreshTokenExpiresMs).toUTCString();

  return {
    user: toPublicUser(foundUser),
    accessToken,
    refreshToken,
    expiresAt: expiresAt,
    refreshTokenExpiresAt: refreshTokenExpiresAt,
  };
};

/**
 * @param {string} token - The refresh token
 *
 * @returns {IWithTokenData} The user with tokens
 */
export const refreshTokenService = async (
  token: string,
): Promise<IWithTokenData> => {
  const hashedRefreshToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const foundRefreshToken =
    await getValidRefreshTokenByHash(hashedRefreshToken);
  if (!foundRefreshToken) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const revoked = await revokeRefreshToken(foundRefreshToken.id);
  if (!revoked) {
    throw new InternalServerError('Failed to revoke refresh token');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  if (typeof decoded === 'string') {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const { id } = decoded as { id: string };

  const foundUser = await getUserById(id);
  if (!foundUser) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const accessToken = jwt.sign({ id: foundUser.id }, process.env.JWT_SECRET!, {
    expiresIn: +process.env.JWT_EXPIRE!,
  });

  const refreshToken = jwt.sign({ id: foundUser.id }, process.env.JWT_SECRET!, {
    expiresIn: +process.env.JWT_REFRESH_EXPIRE!,
  });

  const newHashedRefreshToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  const newRefreshTokenDB = await insertRefreshToken(
    foundUser.id,
    newHashedRefreshToken,
    new Date(Date.now() + +process.env.JWT_REFRESH_EXPIRE! * 1000),
  );
  if (!newRefreshTokenDB) {
    throw new InternalServerError('Failed to store refresh token');
  }

  const expiresMs = Date.now() + +process.env.JWT_EXPIRE! * 1000;
  const expiresAt = new Date(expiresMs).toUTCString();

  const refreshTokenExpiresMs =
    Date.now() + +process.env.JWT_REFRESH_EXPIRE! * 1000;
  const refreshTokenExpiresAt = new Date(refreshTokenExpiresMs).toUTCString();

  return {
    accessToken,
    refreshToken,
    expiresAt: expiresAt,
    refreshTokenExpiresAt: refreshTokenExpiresAt,
  };
};

/**
 * @param {string} phone - The phone number
 * @returns {object} The message and expires at
 */
export const sendResetPasswordLinkService = async (
  phone: string,
): Promise<ISendResetPasswordLinkResponse> => {
  const foundUser = await getUserByPhone(phone);
  if (!foundUser) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const { token, expiresAt } = createResetPasswordToken();
  const newResetPasswordToken = await insertResetPasswordToken(
    token,
    phone,
    expiresAt,
  );
  if (!newResetPasswordToken) {
    throw new InternalServerError('Failed to create reset password link');
  }

  // TODO: Uncomment this when the SMS credentials are ready
  // const message = await sendMessage(
  //   phone,
  //   `You can reset your password from here: ${process.env.CLIENT_URL}/reset-password?token=${token}. It will expire in ${expiresAt.getMinutes()} minutes.`,
  // );
  // if (!message) {
  //   throw new InternalServerError('Failed to send message');
  // }

  return {
    message: 'Reset password link sent successfully',
    expiresAt,
    ...(process.env.NODE_ENV === 'development' && { token }),
  };
};

/**
 * @param {string} phone - The phone number
 * @param {string} token - The token
 * @param {string} newPassword - The new password
 *
 * @returns {object} The message
 */
export const resetPasswordService = async (
  phone: string,
  token: string,
  newPassword: string,
): Promise<{ message: string }> => {
  const foundUser = await getUserByPhone(phone);
  if (!foundUser) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const foundResetPasswordToken =
    await getValidResetPasswordTokenByTokenAndPhone(token, phone);
  if (!foundResetPasswordToken) {
    throw new UnauthorizedError('Token is invalid');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const updatedUser = await updateUserPassword(foundUser.id, hashedPassword);
  if (!updatedUser) {
    throw new InternalServerError('Failed to update password');
  }

  const isMarked = await markResetPasswordTokenAsUsed(token, phone);
  if (!isMarked) {
    throw new InternalServerError(
      'Failed to mark reset password token as used',
    );
  }

  return { message: 'Password updated successfully' };
};

/**
 * @param {string} token - The refresh token
 *
 * @returns {object} The message
 */
export const logoutService = async (
  token: string,
): Promise<{ message: string }> => {
  const hashedRefreshToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  const foundRefreshToken =
    await getValidRefreshTokenByHash(hashedRefreshToken);
  if (!foundRefreshToken) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const revoked = await revokeRefreshToken(foundRefreshToken.id);
  if (!revoked) {
    throw new InternalServerError('Failed to revoke refresh token');
  }

  return { message: 'Logged out successfully' };
};
