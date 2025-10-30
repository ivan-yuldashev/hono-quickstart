import type { MiddlewareHandler } from 'hono';

import { requestId } from 'hono/request-id';

import { createRouter } from '@/infrastructure/http/create-router';
import { notFound } from '@/infrastructure/http/helpers/not-found';
import { onError } from '@/infrastructure/http/helpers/on-error';
import { createPinoLogger } from '@/infrastructure/logging/create-pino-logger';

export function createBaseApp(middlewares: MiddlewareHandler[] = []) {
  const app = createRouter();

  app.use(requestId()).use(createPinoLogger());

  middlewares.forEach((middleware) => {
    app.use(middleware);
  });

  app.notFound(notFound);
  app.onError(onError);

  return app;
}
