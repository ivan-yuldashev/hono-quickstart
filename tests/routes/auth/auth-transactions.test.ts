import { desc, eq } from 'drizzle-orm';
import { testClient } from 'hono/testing';
import { createTestApp } from 'tests/helpers/create-test-app';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/infrastructure/db/db';
import { refreshTokens, users } from '@/infrastructure/db/schema';
import { authRouter } from '@/modules/auth/auth.index';
import { BaseRepository } from '@/shared/core/base.repository';

const client = testClient(createTestApp(authRouter));

describe('auth transactions', () => {
  const TEST_USER = {
    email: 'transact-fail@test.ru',
    password: 'password123',
  };

  const getLatestTokenRecord = async (userEmail: string) => {
    const [record] = await db
      .select()
      .from(refreshTokens)
      .innerJoin(users, eq(refreshTokens.userId, users.id))
      .where(eq(users.email, userEmail))
      .orderBy(desc(refreshTokens.createdAt))
      .limit(1);

    return record?.refresh_tokens;
  };

  beforeEach(async () => {
    await client.register.$post({
      json: TEST_USER,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should rollback token revocation if creating a new token fails', async () => {
    const loginResponse = await client.login.$post({
      json: TEST_USER,
    });

    const cookie = loginResponse.headers.getSetCookie()[0];
    expect(cookie).toBeDefined();

    const initialToken = await getLatestTokenRecord(TEST_USER.email);

    expect(initialToken).toBeDefined();
    expect(initialToken!.revoked).toBe(false);

    vi.spyOn(BaseRepository.prototype, 'create').mockRejectedValueOnce(
      new Error('Simulated DB Crash'),
    );

    const response = await client['refresh-token'].$post(
      {},
      { headers: { Cookie: cookie! } },
    );

    expect(response.status).toBe(500);

    const tokenAfterFail = await getLatestTokenRecord(TEST_USER.email);

    expect(tokenAfterFail).toBeDefined();
    expect(tokenAfterFail!.revoked).toBe(false);
    expect(tokenAfterFail!.id).toBe(initialToken!.id);
  });
});
