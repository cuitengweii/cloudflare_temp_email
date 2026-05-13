import { test, expect } from '@playwright/test';
import * as crypto from 'crypto';

import {
  createTestAddress,
  deleteAddress,
  seedTestMail,
  TEST_DOMAIN,
  WORKER_URL,
} from '../../fixtures/test-helpers';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

test.describe('Employee mailbox binding', () => {
  test('allows employee inbox to read bound mailbox regardless of recipient address casing', async ({ request }) => {
    const employee = await createTestAddress(request, 'employee-inbox-bind', TEST_DOMAIN);
    let userId: number | null = null;

    try {
      const loginPassword = 'InboxPass123';

      const createUserRes = await request.post(`${WORKER_URL}/admin/users`, {
        data: {
          email: employee.address,
          password: hashPassword(loginPassword),
        },
      });
      expect(createUserRes.ok()).toBe(true);

      const queryUserRes = await request.get(
        `${WORKER_URL}/admin/users?limit=5&offset=0&query=${encodeURIComponent(employee.address)}`
      );
      expect(queryUserRes.ok()).toBe(true);
      const queryUserBody = await queryUserRes.json();
      userId = queryUserBody.results?.[0]?.id ?? null;
      expect(userId).toBeTruthy();

      const bindRes = await request.post(`${WORKER_URL}/admin/users/bind_address`, {
        data: {
          user_email: employee.address,
          address: employee.address,
        },
      });
      expect(bindRes.ok()).toBe(true);

      const loginRes = await request.post(`${WORKER_URL}/user_api/login`, {
        data: {
          email: employee.address,
          password: hashPassword(loginPassword),
          cf_token: '',
        },
      });
      expect(loginRes.ok()).toBe(true);
      const loginBody = await loginRes.json();
      expect(loginBody.jwt).toBeTruthy();

      const mixedCaseAddress = employee.address.toUpperCase();
      await seedTestMail(request, mixedCaseAddress, {
        subject: 'Employee inbox sees bound mailbox mail',
        text: 'bound mailbox message',
      });

      const inboxRes = await request.get(`${WORKER_URL}/user_api/mails?limit=20&offset=0`, {
        headers: {
          'x-user-token': loginBody.jwt,
        },
      });
      expect(inboxRes.ok()).toBe(true);
      const inboxBody = await inboxRes.json();
      expect(inboxBody.count).toBeGreaterThan(0);
      expect(inboxBody.results.some((item: { subject?: string }) => item.subject === 'Employee inbox sees bound mailbox mail')).toBe(true);
    } finally {
      if (userId) {
        await request.delete(`${WORKER_URL}/admin/users/${userId}`);
      }
      await deleteAddress(request, employee.jwt);
    }
  });
});
