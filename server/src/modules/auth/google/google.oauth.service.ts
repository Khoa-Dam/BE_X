import crypto from 'crypto';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { env } from '../../../env';
import { UserModel, Role, AuthProvider } from '../../../models/User';
import { AppError } from '../../../utils/response';

function createOAuthClient() {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
        throw new AppError('GOOGLE_CONFIG_MISSING', 'Missing Google OAuth envs', 500);
    }
    return new OAuth2Client({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        redirectUri: env.GOOGLE_CALLBACK_URL,
    });
}

export function buildGoogleAuthUrl(state: string) {
    const client = createOAuthClient();
    return client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['openid', 'email', 'profile'],
        state,
    });
}

async function exchangeCodeForTokens(code: string) {
    const client = createOAuthClient();
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) throw new AppError('GOOGLE_AUTH_FAILED', 'No id_token returned', 401);
    return tokens;
}

async function verifyIdToken(idToken: string) {
    const client = createOAuthClient();
    const ticket = await client.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID! });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload?.email) throw new AppError('GOOGLE_AUTH_FAILED', 'Invalid id_token', 401);
    return payload as TokenPayload;
}

async function upsertGoogleUser(p: TokenPayload) {
    let user = await UserModel.findOne({ googleId: p.sub! });
    if (!user) {
        user = await UserModel.findOne({ email: p.email! });
        if (user) {
            user.googleId = p.sub!;
            user.provider = AuthProvider.GOOGLE;
            if (!user.name) user.name = p.name || p.email!;
            await user.save();
        } else {
            user = await UserModel.create({
                name: p.name || p.email!,
                email: p.email!,
                passwordHash: null,
                role: Role.USER,
                provider: AuthProvider.GOOGLE,
                googleId: p.sub!,
            });
        }
    }
    return user;
}

export function generateState() {
    return crypto.randomBytes(16).toString('hex');
}

export async function handleGoogleCallback(code: string) {
    const tokens = await exchangeCodeForTokens(code);
    const payload = await verifyIdToken(tokens.id_token!);
    const user = await upsertGoogleUser(payload);
    return { user, googleTokens: tokens, googlePayload: payload };
}
