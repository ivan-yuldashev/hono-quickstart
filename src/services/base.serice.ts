import type { SQL } from 'drizzle-orm';

import type { Repository } from '@/repositories/types';
import type { Page, Pagination } from '@/shared/types/api';
import type { FullPartial, IdType } from '@/shared/types/utils';

import { omitUndefined } from '@/shared/utilities/omit-undefined';

interface FindByParams extends Pagination {
  orderBy?: SQL;
  where?: SQL;
}

interface CountParams {
  where?: SQL;
}

export class BaseService<Create, Read> {
  protected readonly repository: Repository<Create, Read>;

  constructor(repository: Repository<Create, Read>) {
    this.repository = repository;
  }

  async count(params: CountParams): Promise<number> {
    return this.repository.count(params);
  }

  async create(data: Omit<Create, 'createdAt' | 'id' | 'updatedAt'>): Promise<Read | undefined> {
    return this.repository.create({ data });
  }

  async delete(where: SQL): Promise<Read[]> {
    return this.repository.deleteBy({ where });
  }

  async deleteById(id: IdType<Read>): Promise<Read | undefined> {
    return this.repository.deleteById({ id });
  }

  async find(params: FindByParams): Promise<Page<Read>> {
    const { where } = params;

    const [docs, total] = await Promise.all([
      this.repository.findBy(params),
      this.repository.count(where ? { where } : {}),
    ]);

    return { docs, total };
  }

  async findById(id: IdType<Read>): Promise<Read | undefined> {
    return this.repository.findById({ id });
  }

  async update(raw: FullPartial<Omit<Create, 'createdAt' | 'id' | 'updatedAt'>>, where: SQL): Promise<Read[]> {
    const data = omitUndefined(raw);
    return this.repository.updateBy({ data, where });
  }

  async updateById(
    id: IdType<Read>,
    raw: FullPartial<Omit<Create, 'createdAt' | 'id' | 'updatedAt'>>,
  ): Promise<Read | undefined> {
    const data = omitUndefined(raw);
    return this.repository.updateById({ data, id });
  }
}
