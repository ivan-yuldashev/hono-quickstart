import type { Hook } from '@hono/zod-openapi';
import type { TypedResponse } from 'hono';

import type { ValidationProblem } from '@/shared/problem/types';
import type { AppBindings } from '@/shared/types/app';
import type { HttpErrorStatusName } from '@/shared/types/statuses';

import { problem } from '@/shared/problem/problem';

export const defaultHook: Hook<
  unknown,
  AppBindings,
  string,
  TypedResponse<ValidationProblem<Extract<HttpErrorStatusName, 'UNPROCESSABLE_ENTITY'>>> | void
> = (result, c) => {
  if (!result.success) {
    return problem.validation(c, { target: result.target, zodError: result.error });
  }
};
