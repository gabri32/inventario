import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middlewares/validate';
import { authenticateJWT } from '../../middlewares/authenticate';
import { authRateLimiter } from '../../middlewares/rateLimiter';
import { loginSchema } from './auth.validation';

const router = Router();

router.post('/login', authRateLimiter, validate(loginSchema), AuthController.login);
router.get('/me', authenticateJWT, AuthController.me);
router.post('/logout', authenticateJWT, AuthController.logout);

export default router;
