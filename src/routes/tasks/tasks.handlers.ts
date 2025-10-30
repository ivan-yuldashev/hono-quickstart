import { count, eq } from 'drizzle-orm';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from '@/routes/tasks/types';
import type { AppRouteHandler } from '@/shared/types';

import { orm } from '@/infrastructure/db/orm';
import { tasks } from '@/infrastructure/db/schema/task';
import { HttpStatusCodes } from '@/shared/constants/http-status-codes';
import { problem } from '@/shared/problem/problem';

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { limit, offset } = c.req.valid('query');
  const tasksQuery = orm.query.tasks.findMany({
    limit,
    offset,
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  const totalQuery = orm.select({ value: count() }).from(tasks);

  const [docs, totalResult] = await Promise.all([tasksQuery, totalQuery]);

  const total = totalResult.at(0)?.value ?? 0;

  return c.json(
    {
      docs,
      total,
    },
    HttpStatusCodes.OK,
  );
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const task = c.req.valid('json');
  const [inserted] = await orm.insert(tasks).values(task).returning();

  return c.json(inserted, HttpStatusCodes.CREATED);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid('param');

  const task = await orm.query.tasks.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (!task) {
    return problem.notFound(c);
  }

  return c.json(task, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0) {
    const task = await orm.query.tasks.findFirst({
      where(fields, operators) {
        return operators.eq(fields.id, id);
      },
    });

    if (!task) {
      return problem.notFound(c);
    }

    return c.json(task, HttpStatusCodes.OK);
  }

  const [task] = await orm.update(tasks).set(updates).where(eq(tasks.id, id)).returning();

  if (!task) {
    return problem.notFound(c);
  }

  return c.json(task, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid('param');
  const result = await orm.delete(tasks).where(eq(tasks.id, id));

  if (result.rowCount === 0) {
    return problem.notFound(c);
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
