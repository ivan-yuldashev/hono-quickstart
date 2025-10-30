import type { Context, ValidationTargets } from 'hono';

import type { ProblemOptions } from '@/shared/problem/types';

import { HttpErrorCode } from '@/shared/constants/http-error-code';
import { problemResponse } from '@/shared/problem/helpers/problem-response';

function createProblemHandler<C extends HttpErrorCode>(code: C) {
  return (c: Context, message?: string) => problemResponse<C>(c, code, message !== undefined ? { message } : {});
}

export const problem = {
  badRequest: createProblemHandler(HttpErrorCode.BAD_REQUEST),
  conflict: createProblemHandler(HttpErrorCode.CONFLICT),
  notFound: createProblemHandler(HttpErrorCode.NOT_FOUND),
  serverError: createProblemHandler(HttpErrorCode.INTERNAL_SERVER_ERROR),
  unauthorized: createProblemHandler(HttpErrorCode.UNAUTHORIZED),
  unprocessableEntity: createProblemHandler(HttpErrorCode.UNPROCESSABLE_ENTITY),

  validation: <T extends keyof ValidationTargets>(c: Context, options: ProblemOptions<T>) =>
    problemResponse(c, HttpErrorCode.UNPROCESSABLE_ENTITY, options),
};
