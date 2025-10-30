import { OpenAPIHono } from '@hono/zod-openapi';

import type { AppBindings } from '@/shared/types';

import { defaultHook } from '@/infrastructure/http/helpers/default-hook';

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    defaultHook,
    strict: false,
  });
}
