import type { Problem, ProblemOptions, TargetValue, ValidationProblem } from '@/shared/problem/types';
import type { HttpErrorStatusName } from '@/shared/types';

import { HttpStatusCodes } from '@/shared/constants/http-status-codes';
import { HttpErrorDetails } from '@/shared/problem/constants/http-error-details';
import { ErrorReasonPhrases } from '@/shared/problem/constants/http-status-reason-phrases';
import { isBodyLikeTarget } from '@/shared/problem/helpers/is-body-like-target';
import { zodToErrors } from '@/shared/problem/helpers/zod-to-errors';

interface ProblemParams<K> {
  code: K;
  instance: string;
  message?: string;
  requestId: string;
}

function hasValidation<T extends TargetValue>(
  params: ProblemParams<HttpErrorStatusName> | (ProblemParams<HttpErrorStatusName> & ProblemOptions<T>),
): params is ProblemParams<HttpErrorStatusName> & ProblemOptions<T> {
  return 'zodError' in params && 'target' in params;
}

export function createProblem<C extends HttpErrorStatusName>(params: ProblemParams<C>): Problem<C>;

export function createProblem<C extends HttpErrorStatusName, T extends TargetValue>(
  params: ProblemParams<C> & ProblemOptions<T>,
): ValidationProblem<C>;

export function createProblem<C extends HttpErrorStatusName, T extends TargetValue = never>(
  params: ProblemParams<C> | (ProblemParams<C> & ProblemOptions<T>),
): Problem<C> | ValidationProblem<C> {
  const { code, instance, message, requestId } = params;
  const status = HttpStatusCodes[code];
  const detail = message ?? HttpErrorDetails[code];

  const base = {
    code,
    detail,
    instance,
    requestId,
    status,
    title: ErrorReasonPhrases[code],
  };

  if (hasValidation(params)) {
    const errors = isBodyLikeTarget(params.target)
      ? zodToErrors(params.zodError, params.target)
      : zodToErrors(params.zodError, params.target);

    return {
      ...base,
      errors,
    };
  }

  return base;
}
