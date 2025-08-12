export class HttpError extends Error {
  statusCode: number;
  details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found', details?: any) {
    super(404, message, details);
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad request', details?: any) {
    super(400, message, details);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized', details?: any) {
    super(401, message, details);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden', details?: any) {
    super(403, message, details);
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Conflict', details?: any) {
    super(409, message, details);
  }
}

export class InternalServerError extends HttpError {
  constructor(message = 'Internal server error', details?: any) {
    super(500, message, details);
  }
}
