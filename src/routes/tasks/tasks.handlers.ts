import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from '@/routes/tasks/types';
import type { AppRouteHandler } from '@/shared/types/app';

import { HttpStatusCodes } from '@/shared/constants/http-status-codes';
import { problem } from '@/shared/problem/problem';

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { limit, offset } = c.req.valid('query');
  const { app } = c.req;

  const data = await app.tasks.find({ limit, offset });

  return c.json(data, HttpStatusCodes.OK);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const task = c.req.valid('json');
  const { app } = c.req;

  const inserted = await app.tasks.create({ ...task });

  return c.json(inserted, HttpStatusCodes.CREATED);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid('param');
  const { app } = c.req;

  const task = await app.tasks.findById(id);

  if (!task) {
    return problem.notFound(c);
  }

  return c.json(task, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const { app } = c.req;

  const task = await app.tasks.updateById(id, data);

  if (!task) {
    return problem.notFound(c);
  }

  return c.json(task, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid('param');
  const { app } = c.req;

  const task = await app.tasks.deleteById(id);

  if (!task) {
    return problem.notFound(c);
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
