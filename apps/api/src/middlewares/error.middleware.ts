import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@packages/httputils';
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  const error = err.name;
  return res.status(500).json({
    success: false,
    error: { stack: err.stack, message: err.message },
    message: 'Internal Server Error',
  });
};
