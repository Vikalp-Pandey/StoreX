import { EmailService } from '@services/emailservices';
import env from '@packages/env';
import {
  asyncHandler,
  logger,
  sendCookie,
  sendResponse,
  CookieConfig,
} from '@packages/httputils';
import User, { accountType } from '@/models/authModels/user.model';
import jwtService from '@/services/authServices/auth.service';
import userService from '@/services/authServices/user.service';
import { Request, Response } from 'express';
import commonService from '@/services/common.service';
import authService from '@/services/authServices/auth.service';
import { VerificationType } from '@/models/authModels/verifyUser.model';

const cookieConfig = {
  isSecure: env!.NODE_ENV === 'production',
  sameSite: env!.NODE_ENV === 'production' ? 'none' : 'lax',
} as CookieConfig;

const emailService = new EmailService(
  env!.SMTP_NAME,
  env!.SMTP_MAIL,
  env!.SMTP_REPLY_TO,
  env!.SMTP_HOST,
  env!.SMTP_PORT,
  env!.SMTP_USERNAME,
  env!.SMTP_PASSWORD,
);

const setAccessTokenCookie = (
  req: Request,
  res: Response,
  accessToken: string,
  options: any = {},
) => {
  sendCookie(res, 'accessToken', accessToken, cookieConfig, {
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60,
    ...options,
  });

  req.cookies.accessToken = accessToken;
};

const sendOtpEmail = async (
  email: string,
  name: string,
  otp: string,
  subject: string,
) => {
  await emailService.sendEmail({
    to: email,
    subject,
    template: {
      type: 'email_otp',
      data: {
        to_username: name,
        otp,
      },
    },
  });
};

export const getUserStatus = asyncHandler(
  async (req: Request, res: Response) => {
    if (req.user) {
      return sendResponse(res, 200, 'User Info', { user: req.user });
    }
    return sendResponse(res, 401, 'User Info:', { message: 'Not logged in' });
  },
);

export const signupUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const isExisting = await commonService.findInstance(User, 'email', email);

  if (isExisting && isExisting.length > 0) {
    logger('ERROR', 'User already exists:', email);

    return sendResponse(res, 409, 'User with email already exists', {
      isExisting,
    });
  }

  const otp = await jwtService.generateOTP(email, VerificationType.Signup);

  await sendOtpEmail(
    email,
    name,
    otp,
    'Email Verification for Signup on Tierly',
  );

  const user = await userService.createUser({
    name,
    email,
    password,
    accountType: accountType.Local,
    twoFactorEnabled: false,
    emailVerified: false,
  });

  return sendResponse(
    res,
    200,
    'An Otp is sent to email for verification.',
    user,
  );
});

export const signinUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await userService.findUser({ email, password });

  if (!user || !(user.accountType == accountType.Local)) {
    return sendResponse(res, 400, 'User not signed up');
  }

  if (user.emailVerified === false) {
    return sendResponse(res, 403, 'Unverified Email. Please verify this email');
  }

  if (user.twoFactorEnabled) {
    const otp = await authService.generateOTP(
      user.email,
      VerificationType.Signin,
    );

    await sendOtpEmail(
      email,
      user.name,
      otp,
      'OTP Verification through Email on Storex',
    );

    return sendResponse(res, 200, '2fa successfully enabled', {
      twoFactorRequired: true,
      message: 'Otp sent to registered email',
    });
  }

  const accessToken = await jwtService.findandreissueToken(email);

  if (!accessToken) {
    logger('ERROR', 'Token reissue failed:', email);

    return sendResponse(res, 404, 'Access token not found');
  }

  setAccessTokenCookie(req, res, accessToken);

  return sendResponse(res, 200, 'User signed in successfully', {
    user,
    accessToken,
  });
});

export const logoutUser = asyncHandler(async (_req: Request, res: Response) => {
  sendCookie(res, 'accessToken', '', cookieConfig, {
    sameSite: 'lax',
    expires: new Date(0),
  });

  return sendResponse(res, 200, 'Logged out successfully');
});

export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { otp } = req.body;

  if (!otp) {
    logger('ERROR', 'OTP missing in request');
    return sendResponse(res, 400, 'OTP is required');
  }

  const validOtp = await jwtService.validateOTP(otp);

  if (!validOtp) {
    logger('ERROR', 'Invalid OTP attempt');
    return sendResponse(res, 400, 'Invalid OTP');
  }

  const { email, verification_type } = validOtp;

  if (verification_type === VerificationType.Signup) {
    const isExisting = await userService.findUser({ email: validOtp.email });

    if (!isExisting) {
      logger('ERROR', 'User Not Found', validOtp.email);
      return sendResponse(res, 404, 'User Already  exists');
    }

    const accessToken = await jwtService.signJwt(
      { id: isExisting._id.toString() },
      env!.ACCESS_SECRET,
      { expiresIn: env!.ACCESS_SECRET_TTL },
    );

    isExisting.access_token = accessToken;

    await jwtService.deleteOtp(validOtp);

    isExisting.emailVerified = true;

    setAccessTokenCookie(req, res, accessToken);

    return sendResponse(res, 200, 'OTP verified successfully', {
      user: {
        name: isExisting.name,
        email: isExisting.email,
        accessToken,
      },
    });
  }

  if (verification_type === VerificationType.Signin) {
    const user = await userService.findUser({ email });

    if (!user) {
      logger('ERROR', 'User not found for signin OTP:', email);
      return sendResponse(res, 404, 'User not found');
    }

    const accessToken = await jwtService.findandreissueToken(user.email);

    if (!accessToken) {
      return sendResponse(res, 500, 'AccessToken not Found', { accessToken });
    }

    setAccessTokenCookie(req, res, accessToken, { maxAge: 3600000 });

    await jwtService.deleteOtp(validOtp);

    return sendResponse(res, 200, 'OTP verified successfully', {
      user,
      accessToken,
    });
  }
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await userService.findUser({ email });

    if (!user) {
      logger('ERROR', 'Forgot password user not found:', email);
      return sendResponse(res, 404, 'User not found');
    }

    const { token, resetLink } = await jwtService.generateResetTokenandLink();

    await jwtService.saveResetToken(user.id, token);

    await emailService.sendEmail({
      to: email,
      subject: 'Reset Password on E-Bucket',
      template: {
        type: 'forgot_password',
        data: {
          to_username: user.name,
          reset_link: resetLink,
        },
      },
    });

    return sendResponse(res, 200, 'Password reset link sent to email');
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, password } = req.body;

    if (!token || typeof token !== 'string') {
      logger('ERROR', 'Invalid Token Type or missing', token);
      return sendResponse(res, 403, 'Invalid Token Type');
    }

    const validToken = await jwtService.validateToken(token);

    if (!validToken) {
      logger('ERROR', 'Invalid or expired reset token');
      return sendResponse(res, 400, 'Invalid or expired reset token');
    }

    const user = await userService.findUser({
      id: validToken.userId.toString(),
    });

    if (!user) {
      logger('ERROR', 'Reset token valid but user not found');
      return sendResponse(res, 404, 'User not found');
    }

    user.password = password;

    await user.save();

    return sendResponse(res, 200, 'Password reset successful');
  },
);

const jwtAuthController = {
  getUserStatus,
  signupUser,
  signinUser,
  logoutUser,
  verifyOTP,
  forgotPassword,
  resetPassword,
};

export default jwtAuthController;
