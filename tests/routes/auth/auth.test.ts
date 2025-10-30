import { testClient } from 'hono/testing';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { cookieNameRegex } from 'tests/helpers/cookie-name-regex';
import { createTestApp } from 'tests/helpers/create-test-app';
import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';

import router from '@/routes/auth/auth.index';

const client = testClient(createTestApp(router));

describe('auth routes', () => {
  const existingEmail = 'auth-user@test.ru';
  const existingPassword = 'password123';

  beforeAll(async () => {
    await client.register.$post({
      json: {
        email: existingEmail,
        password: existingPassword,
      },
    });
  });

  describe('post /register:', () => {
    it('should register a new user successfully', async () => {
      const email = 'newuser@test.ru';
      const password = 'password123';

      const response = await client.register.$post({
        json: {
          email,
          password,
        },
      });

      expect(response.status).toBe(HttpStatusCodes.CREATED);

      if (response.status === HttpStatusCodes.CREATED) {
        const json = await response.json();

        expect(json.email).toBe(email);
        expect(json).not.toHaveProperty('password');
        expect(json).not.toHaveProperty('hash');

        expectTypeOf(json.id).toBeString();
      }

      const cookies = response.headers.getSetCookie();
      expect(cookies).toHaveLength(1);

      const tokenCookie = cookies[0];
      expect(tokenCookie).toMatch(cookieNameRegex);
      expect(tokenCookie).toContain('HttpOnly');
      expect(tokenCookie).toContain('SameSite=Strict');
      expect(tokenCookie).toContain('Path=/');
      expect(tokenCookie).toContain('Max-Age=86400');
    });

    it('should fail if the email is already taken', async () => {
      const response = await client.register.$post({
        json: {
          email: existingEmail,
          password: existingPassword,
        },
      });

      expect(response.status).toBe(HttpStatusCodes.CONFLICT);
    });

    it('should fail if the password is too short', async () => {
      const response = await client.register.$post({
        json: {
          email: 'shortpass@test.ru',
          password: '123',
        },
      });

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);

      if (response.status === HttpStatusCodes.UNPROCESSABLE_ENTITY) {
        const json = await response.json();

        expect(json.errors[0]?.source).toHaveProperty('pointer');

        if (json.errors[0] && 'pointer' in json.errors[0].source) {
          expect(json.errors[0].source.pointer).toBe('/body/password');
        }
      }
    });

    it('should fail if the email format is invalid', async () => {
      const response = await client.register.$post({
        json: {
          email: 'not-an-email',
          password: 'password123',
        },
      });

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);

      if (response.status === HttpStatusCodes.UNPROCESSABLE_ENTITY) {
        const json = await response.json();

        expect(json.errors[0]?.source).toHaveProperty('pointer');

        if (json.errors[0] && 'pointer' in json.errors[0].source) {
          expect(json.errors[0].source.pointer).toBe('/body/email');
        }
      }
    });
  });

  describe('post /login:', () => {
    it('should log in successfully and set a secure cookie', async () => {
      const response = await client.login.$post({
        json: {
          email: existingEmail,
          password: existingPassword,
        },
      });

      expect(response.status).toBe(HttpStatusCodes.OK);

      const cookies = response.headers.getSetCookie();
      expect(cookies).toHaveLength(1);

      const tokenCookie = cookies[0];
      expect(tokenCookie).toMatch(cookieNameRegex);
      expect(tokenCookie).toContain('HttpOnly');
      expect(tokenCookie).toContain('SameSite=Strict');
      expect(tokenCookie).toContain('Path=/');
      expect(tokenCookie).toContain('Max-Age=86400');
    });

    it('should fail with an incorrect password', async () => {
      const response = await client.login.$post({
        json: {
          email: existingEmail,
          password: 'wrongpassword',
        },
      });

      expect(response.status).toBe(HttpStatusCodes.UNAUTHORIZED);
    });

    it('should fail if the user does not exist', async () => {
      const response = await client.login.$post({
        json: {
          email: 'nosuchuser@test.ru',
          password: 'password123',
        },
      });

      expect(response.status).toBe(HttpStatusCodes.UNAUTHORIZED);
    });
  });
});
