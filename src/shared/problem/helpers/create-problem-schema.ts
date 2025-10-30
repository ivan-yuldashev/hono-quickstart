import { z } from 'zod';

import type { HttpErrorCode } from '@/shared/constants/http-error-code';
import type { HttpStatusCode } from '@/shared/types';

import { HttpStatusCodes } from '@/shared/constants/http-status-codes';
import { HttpErrorDetails } from '@/shared/problem/constants/http-error-details';

import { HttpStatusPhrases } from '../constants/http-status-phrases';

type HttpDetail<C extends HttpErrorCode> = (typeof HttpErrorDetails)[C];

export function createProblemSchema<C extends HttpErrorCode>(code: C, message?: string) {
  const httpStatusCode: HttpStatusCode<C> = HttpStatusCodes[code];
  const errorDetail: HttpDetail<C> = HttpErrorDetails[code];
  const title = HttpStatusPhrases[code];

  return z.object({
    code: z.literal(code),
    detail: z.literal(message ?? errorDetail),
    instance: z.string(),
    requestId: z.string(),
    status: z.literal(httpStatusCode),
    title: z.literal(title),
  });
}
