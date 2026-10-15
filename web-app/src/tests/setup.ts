import { beforeAll } from 'vitest';

beforeAll(() => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set — did Vitest load .env.test?');
  }
  if (!url.includes('_test')) {
    throw new Error(
      `Refusing to run tests against "${url}" — DATABASE_URL must point to a *_test database.`
    );
  }
});
