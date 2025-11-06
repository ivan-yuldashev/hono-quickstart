import { z } from 'zod';

import type { ErrorStatusCode } from '@/shared/problem/types';
import type { HttpErrorStatusName } from '@/shared/types';

import { HttpStatusCodes } from '@/shared/constants/http-status-codes';
import { HttpErrorDetails } from '@/shared/problem/constants/http-error-details';
import { ErrorReasonPhrases } from '@/shared/problem/constants/http-status-reason-phrases';

type HttpErrorDetail<C extends HttpErrorStatusName> = (typeof HttpErrorDetails)[C];
type HttpErrorTitle<C extends HttpErrorStatusName> = (typeof ErrorReasonPhrases)[C];

export function createProblemSchema<C extends HttpErrorStatusName>(code: C, message?: string) {
  const httpStatusCode: ErrorStatusCode<C> = HttpStatusCodes[code];
  const errorDetail: HttpErrorDetail<C> = HttpErrorDetails[code];
  const title: HttpErrorTitle<C> = ErrorReasonPhrases[code];

  return z.object({
    code: z.literal(code),
    detail: z.literal(message ?? errorDetail),
    instance: z.string(),
    requestId: z.string(),
    status: z.literal(httpStatusCode),
    title: z.literal(title),
  });
}
