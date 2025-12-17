import type { InferSelectModel } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';

import type {
  CountParams,
  CreateParams,
  DeleteByIdParams,
  DeleteByParams,
  FindByIdParams,
  FindByParams,
  Repository,
  StrictShape,
  UpdateByIdParams,
  UpdateByParams,
} from '@/shared/types/repository';
import type { BaseFieldsName, WithoutBaseFields } from '@/shared/types/utils';

import { count, eq } from 'drizzle-orm';

import { getExecutor } from '@/infrastructure/db/context';
import { sortToSql } from '@/shared/helpers/sort-to-sql';

export class BaseRepository<
  Table extends PgTable & Record<BaseFieldsName, PgColumn>,
  Data extends object = InferSelectModel<Table>,
> implements Repository<Data> {
  constructor(protected readonly table: Table) {}

  async count({ where }: CountParams) {
    const executor = getExecutor();

    const [countResult] = await executor
      .select({ value: count() })
      .from(this.table as PgTable)
      .where(where);

    return countResult?.value ?? 0;
  }

  async create<D extends WithoutBaseFields<Data>>({ data }: CreateParams<StrictShape<D, WithoutBaseFields<Data>>>) {
    const executor = getExecutor();

    const [insertedItem] = await executor
      .insert(this.table as PgTable)
      .values(data)
      .returning();

    return insertedItem as Data | undefined;
  }

  async deleteBy({ where }: DeleteByParams) {
    const executor = getExecutor();

    const deletedItems = await executor
      .delete(this.table as PgTable)
      .where(where)
      .returning();

    return deletedItems as Data[];
  }

  async deleteById({ id }: DeleteByIdParams<Data>) {
    const executor = getExecutor();

    const [deletedItem] = await executor
      .delete(this.table)
      .where(eq(this.table.id, id))
      .returning();

    return deletedItem as Data | undefined;
  }

  async findBy({ limit, offset, sort, where }: FindByParams<Data>) {
    const executor = getExecutor();

    const results = await executor
      .select()
      .from(this.table as PgTable)
      .where(where)
      .orderBy(...sortToSql<Data, Table>(sort ?? ['createdAt'], this.table))
      .limit(limit)
      .offset(offset);

    return results as Data[];
  }

  async findById({ id }: FindByIdParams<Data>) {
    const executor = getExecutor();

    const [item] = await executor
      .select()
      .from(this.table as PgTable)
      .where(eq(this.table.id, id));

    return item as Data | undefined;
  }

  async updateBy<D extends Partial<WithoutBaseFields<Data>>>({
    data,
    where,
  }: UpdateByParams<StrictShape<D, WithoutBaseFields<Data>>>) {
    const executor = getExecutor();

    const updatedItems = await executor
      .update(this.table)
      .set(data)
      .where(where)
      .returning();

    return updatedItems as Data[];
  }

  async updateById<D extends Partial<WithoutBaseFields<Data>>>({
    data,
    id,
  }: UpdateByIdParams<StrictShape<D, WithoutBaseFields<Data>>>) {
    const executor = getExecutor();

    const [updatedItem] = await executor
      .update(this.table as PgTable)
      .set(data)
      .where(eq(this.table.id, id))
      .returning();

    return updatedItem as Data | undefined;
  }
}
