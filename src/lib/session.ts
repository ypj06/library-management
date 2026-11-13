import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * 基于签名 Cookie 的会话实现（无状态）。
 *
 * 思路：把 { userId, exp } 序列化成 JSON，base64url 编码后作为载荷，
 * 再用服务端密钥做 HMAC-SHA256 得到签名，拼成 "载荷.签名" 写进 Cookie。
 *
 * - 用户改不了载荷：没有密钥就算不出合法签名
 * - 服务端不用存 session 表：验签 + 检查过期时间即可
 * - 代价：没法在服务端"踢人下线"，需要主动吊销时要改成数据库会话
 */

const COOKIE_NAME = "shuge_session";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 天

// 开发环境没有配置时用固定值兜底，保证 clone 下来直接能跑；
// 生产环境必须在 .env 里配置 SESSION_SECRET，否则签名可被伪造。
const SECRET =
  process.env.SESSION_SECRET ?? "dev-only-secret-change-me-in-production";

type SessionPayload = {
  userId: string;
  exp: number; // 过期时间戳（毫秒）
};

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export async function createSession(userId: string): Promise<void> {
  const payload: SessionPayload = {
    userId,
    exp: Date.now() + MAX_AGE_SECONDS * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const store = await cookies();
  store.set(COOKIE_NAME, `${body}.${sign(body)}`, {
    httpOnly: true, // 禁止 JS 读取，降低 XSS 窃取风险
    sameSite: "lax", // 阻止跨站 POST 携带，缓解 CSRF
    path: "/",
    maxAge: MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production", // 生产环境仅 HTTPS
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

/**
 * 读取并校验会话，返回 userId；无效、被篡改或已过期都返回 null。
 */
export async function readSession(): Promise<string | null> {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return null;

  const separator = value.lastIndexOf(".");
  if (separator === -1) return null;

  const body = value.slice(0, separator);
  const signature = value.slice(separator + 1);

  const expected = sign(body);
  const given = Buffer.from(signature);
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (typeof payload.userId !== "string" || payload.exp < Date.now()) {
      return null;
    }
    return payload.userId;
  } catch {
    return null;
  }
}
