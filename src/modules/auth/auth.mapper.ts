import { IUser } from './auth.types';

export const toPublicUser = (
  user: IUser,
): Omit<IUser, 'id' | 'password' | 'created_at' | 'updated_at'> => {
  const { id, password, created_at, updated_at, ...rest } = user;
  return rest as Omit<IUser, 'id' | 'password' | 'created_at' | 'updated_at'>;
};
