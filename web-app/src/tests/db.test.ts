import { describe, it, expect } from 'vitest';
import { sql } from 'drizzle-orm';
import { db } from '../lib/server/db';

describe('db', () => {
  it('connects to the test database', async () => {
    const result = await db.execute(sql`SELECT current_database()`);
    expect(result[0].current_database).toContain('_test');
  });
});
