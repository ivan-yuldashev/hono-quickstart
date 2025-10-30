import { jsonContent } from 'stoker/openapi/helpers';

import { HttpErrorCode } from '@/shared/constants/http-error-code';
import { HttpStatusCodes } from '@/shared/constants/http-status-codes';
import { createProblemSchemaWithExample } from '@/shared/problem/create-problem-schema-with-example';

export const unauthorizedResponse = {
  [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
    createProblemSchemaWithExample(HttpErrorCode.UNAUTHORIZED, '/'),
    'Authotization error',
  ),
};

export const internalServerErrorResponse = {
  [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
    createProblemSchemaWithExample(HttpErrorCode.INTERNAL_SERVER_ERROR, '/'),
    'Internal server error',
  ),
};
