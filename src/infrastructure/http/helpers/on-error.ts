import type { Context } from 'hono';

import { DrizzleQueryError } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { DatabaseError } from 'pg';

import type { AppBindings } from '@/shared/types';

import { LogLevel } from '@/shared/constants/log-level';
import { problem } from '@/shared/problem/problem';

export function onError(err: Error, c: Context<AppBindings>) {
  const { method, path } = c.req;
  const { logger } = c.var;

  const context = {
    request: {
      method,
      path,
    },
    requestId: c.var.requestId,
  };

  if (err instanceof DrizzleQueryError && err.cause instanceof DatabaseError) {
    const { code = '' } = err.cause;

    logger.warn({ ...context, err }, `Handled DatabaseError: ${err.message}`);

    switch (code) {
      case '22001':
      case '22003':
      case '22P02':
        return problem.badRequest(c);

      case '23502':
      case '23503':
      case '23514':
        return problem.unprocessableEntity(c);

      case '23505':
        return problem.conflict(c);
      default:
        return problem.serverError(c);
    }
  }

  if (err instanceof HTTPException) {
    const logLevel = err.status < 500 ? LogLevel.WARN : LogLevel.ERROR;

    // TODO: Review and implement missing use cases
    // eslint-disable-next-line ts/switch-exhaustiveness-check
    switch (err.status) {
      case 401:
        logger[logLevel]({ ...context, err }, 'Unauthorized');
        return problem.unauthorized(c);
      default:
        logger[logLevel]({ ...context, err }, `Handled HTTPException: ${err.status}`);
        return err.getResponse();
    }
  }

  logger.error({ ...context, err }, `Unhandled error caught: ${err.message}`);

  return problem.serverError(c);
}
