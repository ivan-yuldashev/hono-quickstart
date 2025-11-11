import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { deleteCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';

import type { LoginRoute, LogoutRoute, RegisterRoute } from '@/routes/auth/types';
import type { AppRouteHandler } from '@/shared/types/app';

import { env } from '@/infrastructure/config/env';
import { users } from '@/infrastructure/db/schema';
import { userRepository } from '@/repositories/user.repository';
import { getJwtPayload, setCookie } from '@/routes/auth/helpers';
import { HttpStatusCodes } from '@/shared/constants/http-status-codes';
import { problem } from '@/shared/problem/problem';

export const login: AppRouteHandler<LoginRoute> = async (c) => {
  const { email, password } = c.req.valid('json');

  const [user] = await userRepository.findBy({ limit: 1, offset: 0, where: eq(users.email, email) });

  if (!user) {
    return problem.unauthorized(c, 'Login or password is incorrect');
  }

  const isPasswordValid = await bcrypt.compare(password, user.hash);

  if (!isPasswordValid) {
    return problem.unauthorized(c, 'Login or password is incorrect');
  }

  const token = await sign(getJwtPayload(user), env.SECRET);
  setCookie(c, token);

  return c.json(user, HttpStatusCodes.OK);
};

export const logout: AppRouteHandler<LogoutRoute> = async (c) => {
  deleteCookie(c, env.COOKIE_NAME);
  return c.body(null, HttpStatusCodes.NO_CONTENT);
};

export const register: AppRouteHandler<RegisterRoute> = async (c) => {
  const { email, password } = c.req.valid('json');
  const { app } = c.req;

  const hash = await bcrypt.hash(password, 12);

  const user = await app.users.create({ email, hash });

  if (!user) {
    return problem.conflict(c);
  }

  const token = await sign(getJwtPayload(user), env.SECRET);
  setCookie(c, token);

  const { hash: _hash, ...userWithoutHash } = user;

  return c.json(userWithoutHash, HttpStatusCodes.CREATED);
};
