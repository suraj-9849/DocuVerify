export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, code: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid input', details?: unknown) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

export class InvalidTransitionError extends AppError {
  constructor(message: string) {
    super(message, 409, 'INVALID_TRANSITION');
  }
}

export class StaleWriteError extends AppError {
  constructor(
    message = 'This document was changed by someone else. Refresh and try again.',
  ) {
    super(message, 409, 'STALE_WRITE');
  }
}
