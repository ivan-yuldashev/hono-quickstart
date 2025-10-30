import { HttpErrorCode } from '../../constants/http-error-code';

export const HttpErrorDetails: Record<HttpErrorCode, string> = {
  [HttpErrorCode.BAD_REQUEST]: 'Your request is malformed or missing required fields.',
  [HttpErrorCode.CONFLICT]: 'The request conflicts with the current state of the resource.',
  [HttpErrorCode.INTERNAL_SERVER_ERROR]: 'An unexpected error occurred on the server.',
  [HttpErrorCode.NOT_FOUND]: 'The requested resource was not found.',
  [HttpErrorCode.UNAUTHORIZED]: 'You are not authorized to perform this action.',
  [HttpErrorCode.UNPROCESSABLE_ENTITY]: 'Validation failed for the request payload.',
};
