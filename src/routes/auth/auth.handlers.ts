import bcrypt from 'bcrypt';
import { deleteCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';

import type { LoginRoute, LogoutRoute, RegisterRoute } from '@/routes/auth/types';
import type { AppRouteHandler } from '@/shared/types';

import { env } from '@/infrastructure/config/env';
import { orm } from '@/infrastructure/db/orm';
import { users } from '@/infrastructure/db/schema';
import { getJwtPayload, setCookie } from '@/routes/auth/helpers';
import { HttpStatusCodes } from '@/shared/constants/http-status-codes';
import { problem } from '@/shared/problem/problem';

export const login: AppRouteHandler<LoginRoute> = async (c) => {
  const { email, password } = c.req.valid('json');

  const user = await orm.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, email);
    },
  });

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

  const hash = await bcrypt.hash(password, 12);

  const [inserted] = await orm
    .insert(users)
    .values({
      email,
      hash,
    })
    .returning({
      createdAt: users.createdAt,
      email: users.email,
      id: users.id,
      updatedAt: users.updatedAt,
    });

  if (!inserted) {
    return problem.conflict(c);
  }

  const token = await sign(getJwtPayload(inserted), env.SECRET);
  setCookie(c, token);

  return c.json(inserted, HttpStatusCodes.CREATED);
};
