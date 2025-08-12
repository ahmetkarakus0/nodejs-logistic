import { InternalServerError } from '../errors/http-error';

export const handleCatchedError = (
  error: unknown,
  message: string = 'An unknown error occurred',
) => {
  if (error instanceof Error) {
    throw error;
  }

  throw new InternalServerError(message);
};
