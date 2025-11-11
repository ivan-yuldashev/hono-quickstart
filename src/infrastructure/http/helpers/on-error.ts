import type { Context } from 'hono';

import { DrizzleQueryError } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { DatabaseError } from 'pg';

import type { AppBindings } from '@/shared/types/app';

import { ClientErrorStatusCodes, ServerErrorStatusCodes } from '@/shared/constants/http-status-codes';
import { HttpStatusName } from '@/shared/constants/http-status-name';
import { LogLevel } from '@/shared/constants/log-level';
import { problemResponse } from '@/shared/problem/helpers/problem-response';
import { problem } from '@/shared/problem/problem';
import { valueToKeyMap } from '@/shared/utilities/value-to-key-map';

export const HTTP_ERROR_CODE_TO_NAME_MAP = valueToKeyMap({
  ...ClientErrorStatusCodes,
  ...ServerErrorStatusCodes,
});

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
    const { status } = err;

    const logLevel = status < 500 && status !== -1 ? LogLevel.WARN : LogLevel.ERROR;
    logger[logLevel]({ ...context, err }, `Handled HTTPException: ${err.message}`);
    const errorCodeName: HttpStatusName | undefined =
      HTTP_ERROR_CODE_TO_NAME_MAP[status as keyof typeof HTTP_ERROR_CODE_TO_NAME_MAP];

    if (errorCodeName === undefined) {
      logger.error(
        { ...context, err },
        `HTTPException thrown with non-error status code: ${err.status}. Message: ${err.message}`,
      );
    }

    return problemResponse(c, errorCodeName ?? HttpStatusName.INTERNAL_SERVER_ERROR);
  }

  logger.error({ ...context, err }, `Unhandled error caught: ${err.message}`);

  return problem.serverError(c);
}
