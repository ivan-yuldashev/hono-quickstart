import { createMiddleware } from 'hono/factory';

import type { ServicesMap } from '@/infrastructure/services/helpers/services';

import { tasks, users } from '@/infrastructure/db/schema';
import { createServices } from '@/infrastructure/services/helpers/services';

declare module 'hono' {
  interface HonoRequest {
    app: ServicesMap<[typeof users, typeof tasks]>;
  }
}

export const services = createServices([users, tasks] as const);

export const servicesMiddleware = createMiddleware(async (c, next) => {
  c.req.app = services;
  await next();
});
