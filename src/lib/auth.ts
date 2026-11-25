/**
 * 管理员认证：口令只从环境变量读取；会话使用 HMAC 签名令牌，Cookie 不再存口令原文。
 * 本模块同时被 Edge 中间件与 Node 路由引用，故只用 Web Crypto，不依赖 Node 专有 API。
 */

/** 令牌有效期：7 天（秒）。 */
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

/** 读取 ADMIN_PASSWORD；未配置时返回 undefined，认证一律失败。 */
export function getAdminPassword(): string | undefined {
  const password = process.env.ADMIN_PASSWORD?.trim();
  return password ? password : undefined;
}

/** 恒定时间字符串比较，避免口令/签名逐字比对的时序侧信道（长度差异仍会提前返回）。 */
function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** 校验登录口令是否与环境变量一致。 */
export function verifyAdminPassword(candidate: string): boolean {
  const expected = getAdminPassword();
  if (!expected || !candidate) return false;
  return timingSafeEqualStr(candidate, expected);
}

/** 以口令为 HMAC 密钥签名载荷；改口令即全部旧令牌失效。 */
async function signPayload(payload: string): Promise<string> {
  const password = getAdminPassword();
  if (!password) throw new Error('ADMIN_PASSWORD 未配置');
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  // 手写 base64url 编码，避免依赖 Edge 运行时不保证提供的 Node Buffer
  let binary = '';
  for (const byte of new Uint8Array(sig)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** 签发会话令牌：v1.<过期时间戳>.<签名>，不含口令原文。 */
export async function createSessionToken(): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `v1.${exp}`;
  return `${payload}.${await signPayload(payload)}`;
}

/** 校验会话令牌的签名与有效期。 */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token || !getAdminPassword()) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = await signPayload(`v1.${parts[1]}`);
  return timingSafeEqualStr(parts[2], expected);
}

/** 会话 Cookie 名（全站统一）。 */
export const SESSION_COOKIE = 'biojing_token';

/** 从请求的 Cookie 判断是否已登录（供 API 路由做第二层校验）。 */
export async function isAdminRequest(req: { cookies: { get(name: string): { value: string } | undefined } }): Promise<boolean> {
  return verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
}
