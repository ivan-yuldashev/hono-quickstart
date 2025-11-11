import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';

import { getTableName } from 'drizzle-orm';

import type { BaseFieldsName } from '@/repositories/types';

import { BaseRepository } from '@/repositories/base.repository';
import { BaseService } from '@/services/base.serice';

type BaseTable = PgTable & Record<BaseFieldsName, PgColumn>;

export type ServicesMap<T extends readonly BaseTable[]> = {
  [K in T[number]['_']['name']]: BaseService<
    InferInsertModel<Extract<T[number], { _: { name: K } }>>,
    InferSelectModel<Extract<T[number], { _: { name: K } }>>
  >;
};

export function createServices<T extends readonly BaseTable[]>(tables: T): ServicesMap<T> {
  return tables.reduce((acc, table) => {
    (acc as Record<string, unknown>)[getTableName(table)] = new BaseService(new BaseRepository(table));

    return acc;
  }, {} as ServicesMap<T>);
}
