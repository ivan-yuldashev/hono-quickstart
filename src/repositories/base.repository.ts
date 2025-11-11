import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';

import { count, eq } from 'drizzle-orm';

import type {
  BaseFieldsName,
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
  WithoutBaseFields,
} from '@/repositories/types';

import { orm as db } from '@/infrastructure/db/orm';
import { sortToSql } from '@/repositories/helpers/sort-to-sql';

export class BaseRepository<
  Table extends PgTable & Record<BaseFieldsName, PgColumn>,
  Create extends object = InferInsertModel<Table>,
  Read extends object & {
    createdAt: Date;
    id: string;
    updatedAt: Date;
  } = InferSelectModel<Table> & {
    createdAt: Date;
    id: string;
    updatedAt: Date;
  },
> implements Repository<Create, Read>
{
  protected readonly table: Table;

  constructor(table: Table) {
    this.table = table;
  }

  async count({ where }: CountParams) {
    const [countResult] = await db
      .select({ value: count() })
      .from(this.table as PgTable)
      .where(where);

    return countResult?.value ?? 0;
  }

  async create<D extends WithoutBaseFields<Create>>({ data }: CreateParams<StrictShape<D, WithoutBaseFields<Create>>>) {
    const [insertedItem] = await db
      .insert(this.table as PgTable)
      .values(data)
      .returning();

    return insertedItem as Read | undefined;
  }

  async deleteBy({ where }: DeleteByParams) {
    const deletedItems = await db
      .delete(this.table as PgTable)
      .where(where)
      .returning();

    return deletedItems as Read[];
  }

  async deleteById({ id }: DeleteByIdParams<Read>) {
    const [deletedItem] = await db
      .delete(this.table as PgTable)
      .where(eq(this.table.id, id))
      .returning();

    return deletedItem as Read | undefined;
  }

  async findBy({ limit, offset, sort, where }: FindByParams<Read>) {
    const results = await db
      .select()
      .from(this.table as PgTable)
      .where(where)
      .orderBy(...sortToSql<Read, Table>(sort ?? ['createdAt'], this.table))
      .limit(limit)
      .offset(offset);

    return results as Read[];
  }

  async findById({ id }: FindByIdParams<Read>) {
    const [item] = await db
      .select()
      .from(this.table as PgTable)
      .where(eq(this.table.id, id));

    return item as Read | undefined;
  }

  async updateBy<D extends Partial<WithoutBaseFields<Create>>>({
    data,
    where,
  }: UpdateByParams<StrictShape<D, WithoutBaseFields<Create>>>) {
    const updatedItems = await db
      .update(this.table as PgTable)
      .set(data)
      .where(where)
      .returning();

    return updatedItems as Read[];
  }

  async updateById<D extends Partial<WithoutBaseFields<Create>>>({
    data,
    id,
  }: UpdateByIdParams<StrictShape<D, WithoutBaseFields<Create>>, Read>) {
    const [updatedItem] = await db
      .update(this.table as PgTable)
      .set(data)
      .where(eq(this.table.id, id))
      .returning();

    return updatedItem as Read | undefined;
  }
}
