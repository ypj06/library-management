import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * 密码哈希工具。
 *
 * 为什么用 scrypt 而不是 bcrypt：
 * bcrypt 是原生模块，安装时需要编译，换台电脑容易装不上；
 * scrypt 是 Node 内置 crypto 模块提供的算法，零依赖，同样抗暴力破解。
 *
 * 存储格式："盐(hex):哈希(hex)"，盐随机生成，所以同一个密码每次哈希结果都不同，
 * 这样即使撞库也无法通过"哈希相同"反推两个用户用了同一个密码。
 */

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const derived = scryptSync(password, salt, KEY_LENGTH);
  const expected = Buffer.from(hash, "hex");

  // 长度不同时 timingSafeEqual 会直接抛错，先挡掉
  if (expected.length !== derived.length) return false;

  // 用恒定时间比较，避免通过响应耗时逐字节猜出哈希
  return timingSafeEqual(derived, expected);
}
