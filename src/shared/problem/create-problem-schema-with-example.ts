import type { ValidationTargets } from 'hono';

import { z } from '@hono/zod-openapi';

import type { HttpErrorCode } from '@/shared/constants/http-error-code';
import type { TargetValue } from '@/shared/problem/types';

import { createProblem } from '@/shared/problem/create-problem';
import { createProblemSchema } from '@/shared/problem/helpers/create-problem-schema';
import { createValidationProblemSchema } from '@/shared/problem/helpers/create-validation-problem-schema';

interface Options<T extends TargetValue> {
  message?: string;
  schema: z.ZodSchema;
  target: T;
}

type ValidationProblemSchema<C extends HttpErrorCode> = ReturnType<typeof createValidationProblemSchema<C>>;
type ProblemSchema<C extends HttpErrorCode> = ReturnType<typeof createProblemSchema<C>>;

function hasValidation<T extends TargetValue>(options: Options<T>): options is Options<T> {
  return 'schema' in options && 'target' in options;
}

export function createProblemSchemaWithExample<C extends HttpErrorCode>(
  code: C,
  instance: string,
  options?: { message?: string },
): ProblemSchema<C>;

export function createProblemSchemaWithExample<C extends HttpErrorCode, T extends keyof ValidationTargets>(
  code: C,
  instance: string,
  options: Options<T>,
): ValidationProblemSchema<C>;

export function createProblemSchemaWithExample<C extends HttpErrorCode, T extends keyof ValidationTargets = never>(
  code: C,
  instance: string,
  options: { message?: string } | Options<T> = {},
): ProblemSchema<C> | ValidationProblemSchema<C> {
  const withValidation = 'target' in options;
  const withCustomMessage = 'message' in options;
  const message = withCustomMessage ? options.message : undefined;

  const example = createProblem({
    code,
    instance,
    requestId: crypto.randomUUID(),
    ...(message !== undefined && { message }),
    ...(withValidation && {
      target: options.target,
      zodError: options.schema.safeParse(options.schema instanceof z.ZodArray ? {} : 123).error,
    }),
  });

  if (withValidation && hasValidation(options)) {
    return createValidationProblemSchema(code, options.target).openapi({ example });
  }

  return createProblemSchema(code, message).openapi({ example });
}
