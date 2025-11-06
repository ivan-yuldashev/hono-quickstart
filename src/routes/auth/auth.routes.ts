import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';

import { loginSchema, registerSchema, selectUsersSchema } from '@/routes/auth/schemas';
import { HttpStatusName } from '@/shared/constants/http-status-name';
import { Path } from '@/shared/constants/path';
import { internalServerErrorResponse } from '@/shared/openapi/common-responses';
import { createProblemSchemaWithExample } from '@/shared/problem/create-problem-schema-with-example';

const tags = ['Auth'];

const baseAuthRoute = {
  responses: {
    ...internalServerErrorResponse,
  },
  tags,
};

export const login = createRoute({
  ...baseAuthRoute,
  method: 'post',
  path: Path.LOGIN,
  request: {
    body: jsonContentRequired(loginSchema, 'Login'),
  },
  responses: {
    ...baseAuthRoute.responses,
    [HttpStatusCodes.OK]: jsonContent(selectUsersSchema, 'Login successful'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createProblemSchemaWithExample(HttpStatusName.UNAUTHORIZED, '/', { message: 'Login or password is incorrect' }),
      'Login or password is incorrect',
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createProblemSchemaWithExample(HttpStatusName.UNPROCESSABLE_ENTITY, Path.LOGIN, {
        schema: selectUsersSchema,
        target: 'json',
      }),
      'The validation error(s)',
    ),
  },
});

export const logout = createRoute({
  ...baseAuthRoute,
  method: 'post',
  path: Path.LOGOUT,
  responses: {
    ...baseAuthRoute.responses,
    [HttpStatusCodes.NO_CONTENT]: {
      description: 'User logged out',
    },
  },
});

export const register = createRoute({
  ...baseAuthRoute,
  method: 'post',
  path: Path.REGISTER,
  request: {
    body: jsonContentRequired(registerSchema, 'Register'),
  },
  responses: {
    ...baseAuthRoute.responses,
    [HttpStatusCodes.CONFLICT]: jsonContent(
      createProblemSchemaWithExample(HttpStatusName.CONFLICT, Path.REGISTER),
      'User already exists',
    ),
    [HttpStatusCodes.CREATED]: jsonContent(selectUsersSchema, 'Register successful'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createProblemSchemaWithExample(HttpStatusName.UNPROCESSABLE_ENTITY, Path.REGISTER, {
        schema: selectUsersSchema,
        target: 'json',
      }),
      'The validation error(s)',
    ),
  },
});
