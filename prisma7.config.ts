// Prisma CLI 的配置（Prisma 7 起从 schema 文件里独立出来）。
// 数据库连接串从环境变量读取；没有 .env 时退回本地 SQLite 文件，
// 保证 clone 下来直接 `npm run db:setup` 就能运行。
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // `npm run db:seed` 会执行这条命令
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"] ?? "file:./prisma/dev.db",
  },
});
