import { Request, Response, NextFunction, CookieOptions } from 'express';

type handlerFn = (
  req: Request,
  res: Response,
  next: NextFunction,
) => any | Promise<any> | Promise<void>;

export const asyncHandler = (fn: handlerFn, finallyBlock?: any) => {
  // It returns a whole controller function
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await Promise.resolve(fn(req, res, next));
    } catch (error) {
      next(error);
    } finally {
      if (finallyBlock && typeof finallyBlock === 'function') {
        try {
          await Promise.resolve(finallyBlock(req, res, next));
        } catch (error: any) {
          console.error({ FinallyBlockError: error.message });
        }
      }
    }
  };
};

export const sendResponse = (
  res: Response,
  statusCode: number,
  detail?: string,
  data?: Record<string, any>,
) => {
  if (detail) {
    return res.status(statusCode).json({
      success: statusCode < 400,
      statusCode,
      detail,
      ...(data && { data }),
    });
  }
  return res.status(statusCode).json({
    success: statusCode < 400,
    statusCode,
    ...(data && { data }),
  });
};

interface RedirectOptions {
  statusCode?: number;
  queryParams?: Record<string, string | number>;
}

export const sendRedirect = (
  res: Response,
  url: string,
  options?: RedirectOptions,
) => {
  const statusCode = options?.statusCode || 302;

  // Append query params if provided
  let redirectUrl = url;

  // Check if options or queryparams exists or not
  if (options?.queryParams) {
    const params = new URLSearchParams(
      options.queryParams as Record<string, string>,
    ).toString();

    redirectUrl += url.includes('?') ? `&${params}` : `?${params}`;
  }

  return res.redirect(statusCode, redirectUrl);
};

// }
export interface CookieConfig {
  isSecure: boolean;
  sameSite: 'lax' | 'none' | 'strict';
}

export const sendCookie = (
  res: Response,
  label: string,
  token: string,
  config: CookieConfig, // Pass the environment-specific logic here
  options: CookieOptions = {},
) => {
  res.cookie(label, token, {
    httpOnly: true,
    path: '/',
    secure: config.isSecure,
    sameSite: config.sameSite,
    ...options,
  });
};

export const logger = (
  messageInfo: 'INFO' | 'ERROR',
  detail: string,
  message?: unknown,
) => {
  console.log(`${messageInfo}: ${detail}`);
  if (message) {
    console.log(message);
  }
};

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
