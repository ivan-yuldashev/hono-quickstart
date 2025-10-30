import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi';
import type { Schema } from 'hono';
import type { PinoLogger } from 'hono-pino';

import type { HttpErrorCode } from '@/shared/constants/http-error-code';
import type { HttpStatusCodes } from '@/shared/constants/http-status-codes';

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
  };
}

export type AppOpenAPI<S extends Schema = never> = OpenAPIHono<AppBindings, S>;
export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

export type HttpStatusCode<C extends HttpErrorCode> = (typeof HttpStatusCodes)[C];
