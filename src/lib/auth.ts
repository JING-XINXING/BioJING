/**
 * 管理员认证辅助：密码只从环境变量读取，禁止在源码中硬编码。
 */

/** 读取 ADMIN_PASSWORD；未配置时返回 undefined，认证一律失败。 */
export function getAdminPassword(): string | undefined {
  const password = process.env.ADMIN_PASSWORD?.trim();
  return password ? password : undefined;
}

/** 校验登录密码是否与环境变量一致。 */
export function verifyAdminPassword(candidate: string): boolean {
  const expected = getAdminPassword();
  if (!expected || !candidate) {
    return false;
  }
  return candidate === expected;
}
