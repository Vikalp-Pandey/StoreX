import oauthController from '@/controllers/authControllers/oauth.controller';
import { Router } from 'express';

const router = Router();

router.get('/github', oauthController.getGithubURL);
router.get('/signin/callback/github', oauthController.signinwithGithub);

router.get('/google', oauthController.getGoogleURL);
router.get('/signin/callback/google', oauthController.signinwithGoogle);
export default router;





