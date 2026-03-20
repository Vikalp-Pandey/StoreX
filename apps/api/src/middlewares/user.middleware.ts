import { NextFunction, Request, Response } from 'express';
import {
  asyncHandler,
  logger,
  sendRedirect,
  sendResponse,
} from '@packages/httputils';
import { verifyJwt } from '@/services/authServices/auth.service';
import env from '@packages/env';
import userService from '@/services/authServices/user.service';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

interface MyJwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

export const validateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken;
    if (!token) {
      return sendResponse(res, 401, 'Unauthorized User');
    }
    const decoded = await verifyJwt(token, env.ACCESS_SECRET);

    if (!decoded || !decoded.decoded) {
      return sendResponse(res, 401, 'Invalid Token');
    }

    const payload = decoded.decoded as MyJwtPayload;
    const userId = payload.id;

    // logger('INFO', 'User ID extracted', userId);

    const existingUser = await userService.findUser({ id: userId });

    if (!existingUser) {
      return sendResponse(res, 401, 'User not found');
    }

    req.user = existingUser;
    return next();
  },
);
