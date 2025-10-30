import type { Context } from 'hono';
import type { z } from 'zod';

import { setCookie as setBaseCookie } from 'hono/cookie';

import type { selectUsersSchema } from '@/routes/auth/schemas';

import { env, isDevelopment } from '@/infrastructure/config/env';

export function getJwtPayload(user: z.infer<typeof selectUsersSchema>) {
  return {
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    id: user.id,
    sub: user.id,
  };
}

export function setCookie(c: Context, token: string) {
  return setBaseCookie(c, env.COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60,
    path: '/',
    sameSite: 'Strict',
    secure: !isDevelopment,
  });
}
