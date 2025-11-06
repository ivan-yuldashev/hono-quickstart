import type { Context, ValidationTargets } from 'hono';

import type { ProblemOptions } from '@/shared/problem/types';
import type { HttpErrorStatusName } from '@/shared/types';

import { HttpStatusName } from '@/shared/constants/http-status-name';
import { problemResponse } from '@/shared/problem/helpers/problem-response';

function createProblemHandler<C extends HttpErrorStatusName>(code: C) {
  return (c: Context, message?: string) => problemResponse<C>(c, code, message !== undefined ? { message } : {});
}

export const problem = {
  badRequest: createProblemHandler(HttpStatusName.BAD_REQUEST),
  conflict: createProblemHandler(HttpStatusName.CONFLICT),
  notFound: createProblemHandler(HttpStatusName.NOT_FOUND),
  serverError: createProblemHandler(HttpStatusName.INTERNAL_SERVER_ERROR),
  unauthorized: createProblemHandler(HttpStatusName.UNAUTHORIZED),
  unprocessableEntity: createProblemHandler(HttpStatusName.UNPROCESSABLE_ENTITY),

  validation: <T extends keyof ValidationTargets>(c: Context, options: ProblemOptions<T>) =>
    problemResponse(c, HttpStatusName.UNPROCESSABLE_ENTITY, options),
};
