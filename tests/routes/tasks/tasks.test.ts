import { testClient } from 'hono/testing';
import { createTestApp } from 'tests/helpers/create-test-app';
import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';

import { jwt } from '@/infrastructure/auth/jwt';
import authRouter from '@/routes/auth/auth.index';
import router from '@/routes/tasks/tasks.index';
import { HttpStatusCodes } from '@/shared/constants/http-status-codes';

const authClient = testClient(createTestApp(authRouter));
const client = testClient(createTestApp(router, [jwt]));

describe('tasks routes', () => {
  let tokenCookie = '';
  let createdTaskId = '';
  const taskName = 'Learn vitest';

  beforeAll(async () => {
    const email = 'task-user@test.ru';
    const password = 'password123';

    await authClient.register.$post({ json: { email, password } });
    const loginResponse = await authClient.login.$post({ json: { email, password } });

    tokenCookie = loginResponse.headers.getSetCookie().at(0) ?? '';
  });

  describe('post /tasks:', () => {
    it('should fail validation if name is missing', async () => {
      const response = await client.tasks.$post(
        {
          // eslint-disable-next-line ts/ban-ts-comment
          // @ts-expect-error
          json: { done: false },
        },
        { headers: { Cookie: tokenCookie } },
      );

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);

      if (response.status === HttpStatusCodes.UNPROCESSABLE_ENTITY) {
        const json = await response.json();

        expect(json.errors[0]?.source).toHaveProperty('pointer');

        if (json.errors[0] && 'pointer' in json.errors[0].source) {
          expect(json.errors[0].source.pointer).toBe('/body/name');
        }
      }
    });

    it('should create a task successfully', async () => {
      const response = await client.tasks.$post(
        {
          json: { done: false, name: taskName },
        },
        { headers: { Cookie: tokenCookie } },
      );

      expect(response.status).toBe(HttpStatusCodes.CREATED);

      if (response.status === HttpStatusCodes.CREATED) {
        const json = await response.json();

        expect(json.name).toBe(taskName);
        expect(json.done).toBe(false);

        expectTypeOf(json.id).toBeString();

        createdTaskId = json.id;
      }
    });
  });

  describe('get /tasks:', () => {
    it('should list all tasks for the user', async () => {
      const response = await client.tasks.$get(
        {
          query: { limit: 10, offset: 0 },
        },
        { headers: { Cookie: tokenCookie } },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.total).toBe(1);
        expect(json.docs.length).toBe(1);

        if (json.docs.length > 0) {
          expect(json.docs[0]?.id).toBe(createdTaskId);
        }
      }
    });
  });

  describe('get /tasks/:id:', () => {
    it('should fail validation if id is not a valid UUID', async () => {
      const response = await client.tasks[':id'].$get(
        {
          param: { id: 'not-a-uuid' },
        },
        { headers: { Cookie: tokenCookie } },
      );

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);

      if (response.status === HttpStatusCodes.UNPROCESSABLE_ENTITY) {
        const json = await response.json();

        expect(json.errors[0]?.source).toHaveProperty('in');

        if (json.errors[0] && 'in' in json.errors[0].source) {
          expect(json.errors[0].source.in).toBe('param');
        }
      }
    });

    it('should return 404 when task not found', async () => {
      const randomUuid = crypto.randomUUID();
      const response = await client.tasks[':id'].$get(
        {
          param: { id: randomUuid },
        },
        { headers: { Cookie: tokenCookie } },
      );

      expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
    });

    it('should get a single task by id', async () => {
      const response = await client.tasks[':id'].$get(
        {
          param: { id: createdTaskId },
        },
        { headers: { Cookie: tokenCookie } },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.name).toBe(taskName);
      }
    });
  });

  describe('patch /tasks/:id:', () => {
    it('should update a single property of a task', async () => {
      const response = await client.tasks[':id'].$patch(
        {
          json: { done: true },
          param: { id: createdTaskId },
        },
        { headers: { Cookie: tokenCookie } },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.done).toBe(true);
        expect(json.name).toBe(taskName);
      }
    });

    it('should return 404 if task to patch is not found', async () => {
      const response = await client.tasks[':id'].$patch(
        {
          json: { done: true },
          param: { id: crypto.randomUUID() },
        },
        { headers: { Cookie: tokenCookie } },
      );

      expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
    });
  });

  describe('delete /tasks/:id:', () => {
    it('should remove a task', async () => {
      const response = await client.tasks[':id'].$delete(
        {
          param: { id: createdTaskId },
        },
        { headers: { Cookie: tokenCookie } },
      );

      expect(response.status).toBe(HttpStatusCodes.NO_CONTENT);
    });

    it('should return 404 if task to delete is not found', async () => {
      const response = await client.tasks[':id'].$delete(
        {
          param: { id: createdTaskId },
        },
        { headers: { Cookie: tokenCookie } },
      );

      expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
    });
  });
});
