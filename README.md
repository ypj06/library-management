# 书阁 · 图书借阅管理系统

Web 开发课程作业。一个小型图书借阅管理系统：管理员维护馆藏，读者在线借书、还书，系统记录每一次流转。

AI 使用声明见 [AI_USAGE.md](./AI_USAGE.md)。

## 功能与页面对应

| 功能 | 页面 / 位置 | 说明 |
| --- | --- | --- |
| 馆藏列表、搜索、分类筛选、分页 | `/` | 查询条件走 URL，可分享、可后退 |
| 注册 / 登录 / 登出 | `/register`、`/login` | 导航栏随登录状态切换 |
| 借书、还书 | `/`、`/my-loans` | 借期 30 天，逾期标记，单人上限 5 本 |
| 个人借阅记录 | `/my-loans` | 当前在借 + 最近归还 |
| 图书增删改查 | `/admin/books` | 仅管理员可见、可操作 |

演示账号（种子数据内置）：

| 角色 | 邮箱 | 密码 |
| --- | --- | --- |
| 管理员 | admin@example.com | admin123 |
| 读者 | reader@example.com | reader123 |

## 技术栈

| 层 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | Next.js 16（App Router） | Server Components 渲染页面，Server Actions 处理写操作，前后端一体部署 |
| 语言 | TypeScript（strict） | 全链路类型检查 |
| 数据库 | SQLite | 单文件数据库，无需安装数据库服务，克隆后即可运行 |
| ORM | Prisma 7 | schema 声明模型 + 迁移历史 + 类型安全查询；通过 libSQL driver adapter 连接 |
| 样式 | Tailwind CSS 4 | 原子化 CSS，配色与组件类集中定义在 `globals.css` |
| 认证 | 自实现会话 | `node:crypto` 做 scrypt 密码哈希与 HMAC 签名 Cookie，无第三方依赖 |

### 两个值得说明的技术决策

**1. 关闭了脚手架默认的 `cacheComponents`。**
Next.js 16 默认开启 Cache Components（新的预渲染模型），它要求所有读取 Cookie 的页面必须包在 `<Suspense>` 边界里，并在构建期做全量校验。本项目每个页面都要读当前登录用户，开启后会产生大量边界代码，遮蔽「请求 → 查询数据库 → 渲染」这条主线，因此显式关闭，使用传统的动态渲染。

**2. 可借数量不落库。**
`Book` 只存馆藏总量 `totalCopies`，"可借数量"由 `总量 − 未归还借阅数` 实时计算。如果单独维护一个库存字段，借出、归还、编辑馆藏三处都要同步它，任何一处遗漏就会出现库存和借阅记录对不上；实时计算则永远一致。代价是每次列表多查一次在借数量，对数据量小的场景完全可接受。

## 数据模型

```
User 1 ──── * Loan * ──── 1 Book
用户                        图书

User     Book            Loan
id       id              userId
email    title           bookId
name     author          borrowedAt  借出时间
password isbn?           dueAt       应还时间（借出时 +30 天）
role     category        returnedAt  归还时间，NULL = 仍在借
         totalCopies     （逾期 = returnedAt 为空且 dueAt 已过）
         ...
```

- `User.role`：`ADMIN` 管理图书，`READER` 借还书。SQLite 不支持 enum，用字符串存储，取值由 `src/lib/roles.ts` 约束
- `User.password`：不存明文，存 `盐:scrypt哈希`，见 `src/lib/password.ts`
- 关联删除：删除图书时其借阅记录由 `onDelete: Cascade` 一并清理

## 快速开始

```bash
# 1. 安装依赖（postinstall 会自动执行 prisma generate）
npm install

# 2. 初始化数据库并写入种子数据
npm run db:setup

# 3. 启动开发服务器
npm run dev
```

打开 http://localhost:3000 。

> 数据库文件为 `prisma/dev.db`，不纳入版本控制。重置数据回到初始状态：`npm run db:reset`（清库、重建表结构并自动重新写入种子数据）。

## 目录结构

```
prisma/
  schema.prisma        数据模型定义
  migrations/          迁移历史（每次 schema 变更一条）
  seed.ts              种子数据：2 个账号、12 本书、3 条借阅记录
src/
  app/                 路由与页面（App Router）
    actions/           Server Actions：认证、图书、借阅
    (auth)/            登录、注册（独立布局）
    admin/             管理后台（布局层统一做权限守卫）
    my-loans/          个人借阅记录
  components/          通用小组件（提示条）
  lib/                 公共逻辑
    db.ts              Prisma 客户端单例
    auth.ts            getCurrentUser / requireUser / requireAdmin
    session.ts         签名 Cookie 会话
    password.ts        scrypt 密码哈希
    format.ts          日期格式化与逾期计算
  generated/prisma/    Prisma 生成的客户端（不提交）
```

## 认证实现（简述）

不引入 NextAuth，会话是自签名的无状态 Cookie：

1. 登录成功后，把 `{ userId, 过期时间 }` 序列化并用 `SESSION_SECRET` 做 HMAC-SHA256 签名，拼成 `载荷.签名` 写入 HttpOnly Cookie
2. 每次请求，服务端重新计算签名比对（`timingSafeEqual` 防时序攻击），通过后再查库取用户
3. 用户改不了载荷（没有密钥算不出合法签名），服务端也不用存 session 表
4. 代价是无法在服务端主动吊销单个会话；如需该能力，要把会话改为数据库存储

所有写操作（Server Action）内部都重新校验登录与权限，不依赖页面守卫。

## 常用脚本

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建（含类型检查） |
| `npm run lint` | ESLint 检查 |
| `npm run db:setup` | 首次初始化：应用迁移 + 写入种子数据 |
| `npm run db:migrate` | 修改 schema 后生成并应用迁移 |
| `npm run db:seed` | 仅写入种子数据 |
| `npm run db:reset` | 清空数据库、重建表结构并重新写入种子数据 |
| `npm run db:studio` | 打开 Prisma Studio 可视化查看数据 |

## 自测清单

以下流程均已人工走通：

- [x] 未登录访问首页：卡片显示"登录后借阅"，无借阅按钮
- [x] 注册新账号并自动登录；邮箱重复、两次密码不一致有明确提示
- [x] 登录演示账号，导航栏显示昵称与"退出"
- [x] 借书：可借数减一；同一本书按钮变为不可借（自己已借）
- [x] 借书后跳转"我的借阅"，能看到应还日期与剩余天数
- [x] 逾期条目显示红色"逾期 N 天"角标
- [x] 还书：条目从"当前在借"移入"最近归还"，馆藏可借数回填
- [x] 读者访问 /admin/books 被重定向回首页
- [x] 管理员新增图书（必填校验、ISBN 重复提示）、编辑、删除（有确认弹窗）
- [x] 修改馆藏总量小于当前在借数时报错
- [x] 搜索"余华"只出《活着》；分类"科技"只出科技类；分页 12 本共 2 页
- [x] 直接访问不存在的页面显示 404 页
