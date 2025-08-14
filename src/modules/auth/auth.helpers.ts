import { IUser } from '@/modules/auth/auth.types';

type PublicUser = Omit<IUser, 'id' | 'password' | 'created_at' | 'updated_at'>;

export const toPublicUser = (user: IUser): PublicUser => {
  const { id, password, created_at, updated_at, ...rest } = user;
  return rest as PublicUser;
};
