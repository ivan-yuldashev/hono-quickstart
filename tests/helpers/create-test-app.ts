import type { MiddlewareHandler, Schema } from 'hono';

import type { AppOpenAPI } from '@/shared/types';

import { createBaseApp } from '@/infrastructure/http/create-base-app';

export function createTestApp<S extends Schema>(router: AppOpenAPI<S>, middlewares?: MiddlewareHandler[]) {
  const app = createBaseApp(middlewares);
  return app.route('/', router);
}
