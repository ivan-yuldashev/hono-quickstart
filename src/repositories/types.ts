import type { SQL } from 'drizzle-orm';

import type { Pagination } from '@/shared/types/api';
import type { IdType } from '@/shared/types/utils';

export type BaseFieldsName = 'createdAt' | 'id' | 'updatedAt';

export type WithoutBaseFields<T> = Omit<T, BaseFieldsName>;

export type StrictShape<Actual, Expected> = Exclude<keyof Actual, keyof Expected> extends never ? Actual : never;

export type Sort<Fields extends string> = (`-${Fields}` | Fields)[];

export interface FindByParams<T> extends Pagination {
  orderBy?: SQL;
  sort?: Sort<Extract<keyof T, string>>;
  where?: SQL;
}

export interface CountParams {
  where?: SQL;
}

export interface FindByIdParams<T> {
  id: IdType<T>;
}

export interface DeleteByIdParams<T> {
  id: IdType<T>;
}

export interface DeleteByParams {
  where: SQL;
}

export interface CreateParams<D> {
  data: D;
}

export interface UpdateByParams<D> {
  data: D;
  where: SQL;
}

export interface UpdateByIdParams<D, T> {
  data: D;
  id: IdType<T>;
}

export interface Repository<Create, Read> {
  count: (params: CountParams) => Promise<number>;
  create: <D extends WithoutBaseFields<Create>>(
    params: CreateParams<StrictShape<D, WithoutBaseFields<Create>>>,
  ) => Promise<Read | undefined>;
  deleteBy: (params: DeleteByParams) => Promise<Read[]>;
  deleteById: (params: DeleteByIdParams<Read>) => Promise<Read | undefined>;
  findBy: (params: FindByParams<Read>) => Promise<Read[]>;
  findById: (params: FindByIdParams<Read>) => Promise<Read | undefined>;
  updateBy: <D extends Partial<WithoutBaseFields<Create>>>(
    params: UpdateByParams<StrictShape<D, WithoutBaseFields<Create>>>,
  ) => Promise<Read[]>;
  updateById: <D extends Partial<WithoutBaseFields<Create>>>(
    params: UpdateByIdParams<StrictShape<D, WithoutBaseFields<Create>>, Read>,
  ) => Promise<Read | undefined>;
}
