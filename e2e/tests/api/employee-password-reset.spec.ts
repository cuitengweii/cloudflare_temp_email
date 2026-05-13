import { test, expect } from '@playwright/test';
import * as crypto from 'crypto';

import {
  createTestAddress,
  deleteAddress,
  requestSendAccess,
  TEST_DOMAIN,
  WORKER_URL,
} from '../../fixtures/test-helpers';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

test.describe('Employee password reset policy', () => {
  test('disables employee self-service reset endpoints and keeps admin reset available', async ({ request }) => {
    const employee = await createTestAddress(request, 'employee-reset-policy', TEST_DOMAIN);
    let userId: number | null = null;

    try {
      await requestSendAccess(request, employee.jwt);

      const initialPassword = 'InitialPass123';
      const resetPassword = 'ResetPass456';

      const createUserRes = await request.post(`${WORKER_URL}/admin/users`, {
        data: {
          email: employee.address,
          password: hashPassword(initialPassword),
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

      const selfVerifyRes = await request.post(`${WORKER_URL}/user_api/verify_code`, {
        data: {
          email: employee.address,
          cf_token: '',
        },
      });
      expect(selfVerifyRes.status()).toBe(403);
      expect(await selfVerifyRes.text()).toContain('Forgot password is disabled');

      const selfRegisterRes = await request.post(`${WORKER_URL}/user_api/register`, {
        data: {
          email: employee.address,
          password: hashPassword(resetPassword),
          code: '123456',
          cf_token: '',
        },
      });
      expect(selfRegisterRes.status()).toBe(403);
      expect(await selfRegisterRes.text()).toContain('Forgot password is disabled');

      const loginBeforeResetRes = await request.post(`${WORKER_URL}/user_api/login`, {
        data: {
          email: employee.address,
          password: hashPassword(initialPassword),
          cf_token: '',
        },
      });
      expect(loginBeforeResetRes.ok()).toBe(true);

      const adminResetRes = await request.post(`${WORKER_URL}/admin/users/${userId}/reset_password`, {
        data: {
          password: hashPassword(resetPassword),
        },
      });
      expect(adminResetRes.ok()).toBe(true);

      const oldPasswordLoginRes = await request.post(`${WORKER_URL}/user_api/login`, {
        data: {
          email: employee.address,
          password: hashPassword(initialPassword),
          cf_token: '',
        },
      });
      expect(oldPasswordLoginRes.status()).toBe(400);

      const newPasswordLoginRes = await request.post(`${WORKER_URL}/user_api/login`, {
        data: {
          email: employee.address,
          password: hashPassword(resetPassword),
          cf_token: '',
        },
      });
      expect(newPasswordLoginRes.ok()).toBe(true);
      const loginBody = await newPasswordLoginRes.json();
      expect(loginBody.jwt).toBeTruthy();
    } finally {
      if (userId) {
        await request.delete(`${WORKER_URL}/admin/users/${userId}`);
      }
      await deleteAddress(request, employee.jwt);
    }
  });
});
