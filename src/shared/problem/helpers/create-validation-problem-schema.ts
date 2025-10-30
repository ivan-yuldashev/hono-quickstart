import { z } from 'zod';

import type { HttpErrorCode } from '@/shared/constants/http-error-code';
import type { TargetValue } from '@/shared/problem/types';

import { createProblemSchema } from '@/shared/problem/helpers/create-problem-schema';
import { createSourceErrorSchema } from '@/shared/problem/helpers/create-source-error-schema';
import { isBodyLikeTarget } from '@/shared/problem/helpers/is-body-like-target';
import { pointerErrorSchema } from '@/shared/problem/schemas/base-problem-schema';

export function createValidationProblemSchema<C extends HttpErrorCode>(code: C, target: TargetValue) {
  const errorSchema = isBodyLikeTarget(target) ? pointerErrorSchema : createSourceErrorSchema(target);
  return createProblemSchema(code).extend({
    code: z.literal(code),
    errors: z.array(errorSchema).min(1),
  });
}
