import { jwt as baseJwt } from 'hono/jwt';

import { env } from '@/infrastructure/config/env';

export const jwt = baseJwt({
  cookie: env.COOKIE_NAME,
  secret: env.SECRET,
});
