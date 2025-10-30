import type { Context, TypedResponse, ValidationTargets } from 'hono';
import type { StatusCode } from 'hono/utils/http-status';
import type { JSONParsed, JSONValue } from 'hono/utils/types';

import type { HttpErrorCode } from '@/shared/constants/http-error-code';
import type { Problem, ProblemOptions, ValidationProblem } from '@/shared/problem/types';
import type { HttpStatusCode } from '@/shared/types';

import { HttpStatusCodes } from '@/shared/constants/http-status-codes';
import { createProblem } from '@/shared/problem/create-problem';

type JSONRespondReturn<T extends JSONValue, U extends StatusCode> = Response & TypedResponse<JSONParsed<T>, U, 'json'>;

export function problemResponse<C extends HttpErrorCode>(
  c: Context,
  code: C,
  options: { message?: string },
): JSONRespondReturn<Problem<C>, HttpStatusCode<C>>;

export function problemResponse<C extends HttpErrorCode, T extends keyof ValidationTargets>(
  c: Context,
  code: C,
  options: ProblemOptions<T>,
): JSONRespondReturn<ValidationProblem<C>, HttpStatusCode<C>>;

export function problemResponse<C extends HttpErrorCode, T extends keyof ValidationTargets = never>(
  c: Context,
  code: C,
  options: { message?: string } | ProblemOptions<T>,
): JSONRespondReturn<Problem<C>, HttpStatusCode<C>> | JSONRespondReturn<ValidationProblem<C>, HttpStatusCode<C>> {
  const status = HttpStatusCodes[code];
  const requestId = c.var.requestId;
  const instance = c.req.path;

  const problem = createProblem({ code, instance, requestId, ...options });

  return c.json(problem, status, {
    'Content-Type': 'application/problem+json',
  });
}
