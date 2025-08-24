import { Router } from 'express';
import { buildGoogleAuthUrl, generateState, handleGoogleCallback } from './google.oauth.service';
import { issueTokensForUserId } from './auth.service';
import { env } from '../../env';

const router = Router();
const STATE_COOKIE = 'g_oauth_state';

router.get('/google', (req, res) => {
  const state = generateState();
  res.cookie(STATE_COOKIE, state, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 5 * 60 * 1000 });
  res.redirect(buildGoogleAuthUrl(state));
});

router.get('/google/callback', async (req, res, next) => {
  try {
    const { code, state } = req.query as { code?: string; state?: string };
    if (!code || !state) return res.redirect(`${env.FRONTEND_URL}/login?error=missing_code_state`);

    const stateCookie = req.cookies?.[STATE_COOKIE];
    if (!stateCookie || stateCookie !== state)
      return res.redirect(`${env.FRONTEND_URL}/login?error=csrf_state_invalid`);
    res.clearCookie(STATE_COOKIE);

    const { user } = await handleGoogleCallback(code);
    const { accessToken, refreshToken } = await issueTokensForUserId(user._id.toString());

    res.cookie('access_token', accessToken, {
      httpOnly: true, sameSite: 'lax', secure: false,
      maxAge: Number(env.JWT_ACCESS_EXPIRES) * 1000
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true, sameSite: 'lax', secure: false,
      maxAge: Number(env.JWT_REFRESH_EXPIRES) * 1000
    });

    return res.redirect(`${env.FRONTEND_URL}`);
  } catch (e) { next(e); }
});

export default router;
