# 书阁 · 图书借阅管理系统

Web 开发课程作业。一个小型图书借阅管理系统：管理员维护馆藏，读者在线借书、还书，系统记录每一次流转。

## 技术栈

| 层 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | Next.js 16（App Router） | 页面渲染与 Server Actions 一体，前后端不分离部署 |
| 语言 | TypeScript | 全链路类型检查 |
| 数据库 | SQLite | 单文件数据库，无需单独安装服务，便于评审时直接运行 |
| ORM | Prisma 7 | 用 schema 声明模型，自动生成类型安全的查询客户端 |
| 样式 | Tailwind CSS 4 | 原子化 CSS，配合少量自定义组件类 |
| 认证 | 自实现 Session | `node:crypto` 做密码哈希，HttpOnly Cookie 保存会话 |

### 为什么关闭了 Cache Components

脚手架默认开启 `cacheComponents`（Next.js 新的预渲染模型）。该模式要求所有读取 Cookie 的页面都必须包在 `<Suspense>` 边界中，并在构建阶段做全量校验。本项目每个页面都要读当前登录用户，开启后会产生大量边界代码，反而遮蔽了「请求 → 查询数据库 → 渲染」这条主线，因此显式关闭，使用传统的动态渲染。

## 功能

- 账号注册、登录、登出；密码加盐哈希存储
- 馆藏列表、搜索、按分类筛选、分页
- 图书的新增、编辑、删除（仅管理员）
- 借书 / 还书；库存数量联动
- 个人借阅记录、逾期标记
- 权限控制：未登录不可借书，普通用户不能管理图书

## 快速开始

```bash
# 1. 安装依赖（会自动执行 prisma generate）
npm install

# 2. 初始化数据库并写入种子数据
npm run db:setup

# 3. 启动开发服务器
npm run dev
```

打开 http://localhost:3000 。

种子数据内置两个账号：

| 角色 | 邮箱 | 密码 |
| --- | --- | --- |
| 管理员 | admin@example.com | admin123 |
| 读者 | reader@example.com | reader123 |

> 数据库文件为 `prisma/dev.db`，不纳入版本控制。若想重置数据，执行 `npm run db:reset`。

## 目录结构

```
prisma/
  schema.prisma        数据模型定义
  migrations/          迁移历史（每次 schema 变更一条）
  seed.ts              种子数据
src/
  app/                 路由与页面（App Router）
  lib/                 数据库客户端、认证、校验等公共逻辑
  generated/prisma/    Prisma 生成的客户端（不提交）
```

## 常用脚本

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建（含类型检查） |
| `npm run db:migrate` | 根据 schema 生成并应用迁移 |
| `npm run db:seed` | 写入种子数据 |
| `npm run db:reset` | 清空数据库并重建 + 重新写入种子 |
| `npm run db:studio` | 打开 Prisma Studio 可视化查看数据 |

## 文档

- `AI_USAGE.md`：AI 工具使用声明
