import crypto from 'crypto';

export const createResetPasswordToken = () => {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 5);
  return { token, expiresAt };
};
