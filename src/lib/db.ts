import "server-only";

import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 客户端单例。
 *
 * Prisma 7 不再内置数据库引擎，SQLite 通过 driver adapter 接入。
 * 这里用 libSQL 适配器读写本地 .db 文件：它提供预编译二进制，
 * 不需要本机装 C++ 编译环境（better-sqlite3 则需要）。
 */

const DATABASE_URL = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

function createPrismaClient() {
  const adapter = new PrismaLibSql({ url: DATABASE_URL });
  return new PrismaClient({ adapter });
}

// 开发环境下 Next 会热更新模块，若不缓存实例会不断创建新的连接池，
// 最终把文件句柄耗尽。把实例挂到 globalThis 上复用。
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
