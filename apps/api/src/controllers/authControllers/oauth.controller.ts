import jwtService from '@/services/authServices/auth.service';
import env from '@packages/env';
import {
  asyncHandler,
  CookieConfig,
  logger,
  sendCookie,
  sendRedirect,
  sendResponse,
} from '@packages/httputils';
import oauthService from '@/services/authServices/oauth.service';
import userService from '@/services/authServices/user.service';

import { Request, Response, NextFunction } from 'express';

const cookieConfig = {
  isSecure: env!.NODE_ENV === 'production',
  sameSite: env!.NODE_ENV === 'production' ? 'none' : 'lax',
} as CookieConfig;

const handleAuthResponse = (
  res: Response,
  user: any,
  token: string | undefined,
  frontendState: string,
) => {
  const isProduction = env!.NODE_ENV === 'production';

  if (isProduction) {
    return sendResponse(res, 200, 'Authentication Successful', {
      message: 'Production Mode: Frontend not ready, returning JSON.',
      user, // Returns the full user field as requested
      token,
      frontendState,
    });
  }
  return sendRedirect(
    res,
    `${env!.ALLOWED_ORIGINS}/dashboard?state=${frontendState}`,
  );
};

export const getGithubURL = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const githubOauthUrl = await oauthService.getGithubURL();
    // logger('INFO', 'GithubOauthURL:', githubOauthUrl);
    return sendRedirect(res, githubOauthUrl);
  },
);

export const signinwithGithub = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.query;
    if (typeof code !== 'string') {
      return sendResponse(res, 400, 'Invalid Code Type', { code: typeof code });
    }
    // Exchange code for GitHub user info
    const githubUser = await oauthService.signinwithGithub(code);

    // logger('INFO', 'GitHub User Info', githubUser);

    // fetch existing user
    let isExisting = await userService.findUser({ email: githubUser.email });
    logger('INFO', '32 :GitHub User Info', isExisting);

    if (isExisting) {
      logger('ERROR', 'User with this email exists.');

      // Sign a temporary JWT containing username/email for frontend avatar
      const frontendState = await jwtService.signJwt(
        { name: isExisting.name, email: isExisting.email },
        env.ACCESS_SECRET,
        { expiresIn: '10m' },
      );
      const token = await jwtService.findandreissueToken(isExisting.email);
      logger('INFO', 'Access Token:', token);

      if (!token) {
        return sendResponse(res, 404, 'Token not Found');
      }
      sendCookie(res, 'accessToken', token, cookieConfig, {
        maxAge: 1000 * 60 * 60,
      });

      req.cookies.accessToken = token;
      logger('INFO', 'Frontend State', frontendState);
      return handleAuthResponse(res, isExisting, token, frontendState);
    }

    let newUser = await userService.createUser(githubUser);
    // Create JWT token for authentication
    const token = await jwtService.signJwt(
      { id: newUser._id },
      env!.ACCESS_SECRET,
      { expiresIn: '7d' },
    );
    newUser.access_token = token;

    sendCookie(res, 'accessToken', token, cookieConfig, {
      maxAge: 1000 * 60 * 60,
    });
    req.cookies.accessToken = token;
    // Create state JWT with username/email for frontend (avatar letter)
    const frontendState = await jwtService.signJwt(
      { name: newUser.name, email: newUser.email },
      env.ACCESS_SECRET,
      { expiresIn: '10m' },
    );

    // logger('INFO', 'Frontend State', frontendState);

    return handleAuthResponse(res, newUser, token, frontendState);
  },
);

export const getGoogleURL = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const googleOauthUrl = await oauthService.getGoogleURL();
  logger('INFO', 'Google Url', googleOauthUrl);
  return sendRedirect(res, googleOauthUrl);
};

export const signinwithGoogle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.query;
    const isProduction = env.NODE_ENV === 'production';

    if (typeof code !== 'string') {
      return sendResponse(res, 400, 'Invalid Code Type', { code: typeof code });
    }

    const googleUser = await oauthService.signinwithGoogle(code);
    // logger('INFO', 'Google User Info', googleUser);

    let isExisting = await userService.findUser({ email: googleUser.email });
    // logger('INFO', 'Checking for existing user:', isExisting);

    if (isExisting) {
      // logger('INFO', 'User with this email exists. Logging in...');

      const frontendState = await jwtService.signJwt(
        { name: isExisting.name, email: isExisting.email },
        env!.ACCESS_SECRET,
        { expiresIn: '10m' },
      );

      const token = await jwtService.findandreissueToken(isExisting.email);
      // logger('INFO', 'Reissued Access Token:', token);

      if (!token) {
        return sendResponse(res, 404, 'Token not Found');
      }

      sendCookie(res, 'accessToken', token, cookieConfig, {
        maxAge: 1000 * 60 * 60,
      });
      req.cookies.accessToken = token;
      return handleAuthResponse(res, isExisting, token, frontendState);
    }

    let newUser = await userService.createUser(googleUser);

    const token = await jwtService.signJwt(
      { id: newUser._id },
      env.ACCESS_SECRET,
      { expiresIn: '7d' },
    );

    logger('INFO', token);
    newUser.access_token = token;

    sendCookie(res, 'accessToken', token, cookieConfig, {
      maxAge: 1000 * 60 * 60,
    });

    req.cookies.accessToken = token;

    const frontendState = await jwtService.signJwt(
      { name: newUser.name, email: newUser.email },
      env.ACCESS_SECRET,
      { expiresIn: '10m' },
    );
    // logger('INFO', 'Frontend State for New User', frontendState);
    return handleAuthResponse(res, newUser, token, frontendState);
  },
);

const oauthController = {
  getGithubURL,
  signinwithGithub,
  getGoogleURL,
  signinwithGoogle,
};

export default oauthController;
