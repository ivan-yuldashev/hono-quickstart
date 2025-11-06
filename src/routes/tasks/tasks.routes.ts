import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { IdUUIDParamsSchema } from 'stoker/openapi/schemas';

import { insertTasksSchema, patchTasksSchema, selectTaskSchema } from '@/routes/tasks/shemas';
import { HttpStatusName } from '@/shared/constants/http-status-name';
import { Path } from '@/shared/constants/path';
import { createPaginatedResponseSchema } from '@/shared/helpers/create-paginated-response-schema';
import { internalServerErrorResponse, unauthorizedResponse } from '@/shared/openapi/common-responses';
import { createProblemSchemaWithExample } from '@/shared/problem/create-problem-schema-with-example';
import { paginationSchema } from '@/shared/schemas/pagination-schema';

const tags = ['Tasks'];
const pathWithId = `${Path.TASKS}/${crypto.randomUUID()}`;

const baseTaskRoute = {
  responses: {
    ...unauthorizedResponse,
    ...internalServerErrorResponse,
  },
  security: [{ cookieAuth: [] }],
  tags,
};

const taskNotFoundResponse = {
  [HttpStatusCodes.NOT_FOUND]: jsonContent(
    createProblemSchemaWithExample(HttpStatusName.NOT_FOUND, pathWithId),
    'Task not found',
  ),
};

const invalidIdResponse = {
  [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
    createProblemSchemaWithExample(HttpStatusName.UNPROCESSABLE_ENTITY, pathWithId, {
      schema: IdUUIDParamsSchema,
      target: 'param',
    }),
    'Invalid id error',
  ),
};

export const list = createRoute({
  ...baseTaskRoute,
  method: 'get',
  path: Path.TASKS,
  request: {
    query: paginationSchema,
  },
  responses: {
    ...baseTaskRoute.responses,
    [HttpStatusCodes.OK]: jsonContent(createPaginatedResponseSchema(selectTaskSchema), 'The list of tasks'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createProblemSchemaWithExample(HttpStatusName.UNPROCESSABLE_ENTITY, Path.TASKS, {
        schema: paginationSchema,
        target: 'query',
      }),
      'The validation error(s)',
    ),
  },
});

export const create = createRoute({
  ...baseTaskRoute,
  method: 'post',
  path: Path.TASKS,
  request: {
    body: jsonContentRequired(insertTasksSchema, 'The task to create'),
  },
  responses: {
    ...baseTaskRoute.responses,
    [HttpStatusCodes.CREATED]: jsonContent(selectTaskSchema, 'The created task'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createProblemSchemaWithExample(HttpStatusName.UNPROCESSABLE_ENTITY, Path.TASKS, {
        schema: insertTasksSchema,
        target: 'json',
      }),
      'The validation error(s)',
    ),
  },
});

export const getOne = createRoute({
  ...baseTaskRoute,
  method: 'get',
  path: Path.TASK,
  request: {
    params: IdUUIDParamsSchema,
  },
  responses: {
    ...baseTaskRoute.responses,
    ...taskNotFoundResponse,
    ...invalidIdResponse,
    [HttpStatusCodes.OK]: jsonContent(selectTaskSchema, 'The requested task'),
  },
});

export const patch = createRoute({
  ...baseTaskRoute,
  method: 'patch',
  path: Path.TASK,
  request: {
    body: jsonContentRequired(patchTasksSchema, 'The task updates'),
    params: IdUUIDParamsSchema,
  },
  responses: {
    ...baseTaskRoute.responses,
    ...taskNotFoundResponse,
    [HttpStatusCodes.OK]: jsonContent(selectTaskSchema, 'The updated task'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createProblemSchemaWithExample(HttpStatusName.UNPROCESSABLE_ENTITY, pathWithId, {
        schema: patchTasksSchema,
        target: 'json',
      }).or(
        createProblemSchemaWithExample(HttpStatusName.UNPROCESSABLE_ENTITY, pathWithId, {
          schema: IdUUIDParamsSchema,
          target: 'param',
        }),
      ),
      'The validation error(s)',
    ),
  },
});

export const remove = createRoute({
  ...baseTaskRoute,
  method: 'delete',
  path: Path.TASK,
  request: {
    params: IdUUIDParamsSchema,
  },
  responses: {
    ...baseTaskRoute.responses,
    ...taskNotFoundResponse,
    ...invalidIdResponse,
    [HttpStatusCodes.NO_CONTENT]: {
      description: 'Task deleted',
    },
  },
});
