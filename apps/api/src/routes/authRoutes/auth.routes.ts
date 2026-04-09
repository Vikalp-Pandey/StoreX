import { validateUser } from '@/middlewares/user.middleware';
import jwtAuthController from '@/controllers/authControllers/auth.controller';
import oauthController from '@/controllers/authControllers/oauth.controller';
import { Router } from 'express';

const router = Router();

router.get('/me', validateUser, jwtAuthController.getUserStatus);
router.post('/signup', jwtAuthController.signupUser);
// router.post('/email-verification', jwtAuthController.emailVerificationByOTP);
router.post('/signin', validateUser, jwtAuthController.signinUser);
router.post('/logout', validateUser, jwtAuthController.logoutUser);
// Verify OTP Route
router.post('/verify-OTP', jwtAuthController.verifyOTP);

// Forgot Password Route
router.post('/forgot-password', validateUser, jwtAuthController.forgotPassword);

// Reset Password Route
router.post('/reset-password', validateUser, jwtAuthController.resetPassword);

export default router;




