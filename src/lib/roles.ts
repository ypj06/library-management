/**
 * 角色常量。
 * Prisma 的 SQLite 连接器不支持 enum，所以数据库里 role 是字符串，
 * 由这里的常量约束取值范围，避免到处写裸字符串写错。
 */
export const ROLE = {
  ADMIN: "ADMIN",
  READER: "READER",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];
