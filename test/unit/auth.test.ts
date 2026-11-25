// 认证核心单测：口令校验、令牌签发/验签/篡改/过期（对应计划 v1.1 E3）
import { describe, it, expect, beforeAll } from 'vitest';
import { verifyAdminPassword, createSessionToken, verifySessionToken } from '../../src/lib/auth';

beforeAll(() => {
  process.env.ADMIN_PASSWORD = 'unit-test-password';
});

describe('verifyAdminPassword', () => {
  it('正确口令通过、错误口令拒绝', () => {
    expect(verifyAdminPassword('unit-test-password')).toBe(true);
    expect(verifyAdminPassword('wrong')).toBe(false);
    expect(verifyAdminPassword('')).toBe(false);
  });
});

describe('session token', () => {
  it('签发后可验签，且令牌不含口令原文', async () => {
    const token = await createSessionToken();
    expect(token).not.toContain('unit-test-password');
    await expect(verifySessionToken(token)).resolves.toBe(true);
  });

  it('篡改签名被拒', async () => {
    const token = await createSessionToken();
    const forged = token.slice(0, -2) + (token.endsWith('aa') ? 'bb' : 'aa');
    await expect(verifySessionToken(forged)).resolves.toBe(false);
  });

  it('过期令牌被拒', async () => {
    const token = await createSessionToken();
    const [, , sig] = token.split('.');
    const expired = `v1.1.${sig}`;
    await expect(verifySessionToken(expired)).resolves.toBe(false);
  });

  it('改口令后旧令牌失效', async () => {
    const token = await createSessionToken();
    process.env.ADMIN_PASSWORD = 'another-password';
    await expect(verifySessionToken(token)).resolves.toBe(false);
    process.env.ADMIN_PASSWORD = 'unit-test-password';
  });
});
