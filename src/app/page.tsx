import Link from "next/link";

/**
 * 首页（M0 版本）：项目落地页。
 * 本阶段只搭好骨架与视觉基调，M1 接入数据库后这里会展示真实馆藏数据。
 */
export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
        <div className="space-y-5">
          <p className="inline-flex items-center rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            课程作业 · 全栈动态网站
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink">
            把馆藏、借出与归还
            <br />
            放进同一本账里
          </h1>
          <p className="max-w-md text-[15px] leading-7 text-ink-soft">
            书阁是一个小型的图书借阅管理系统。管理员维护书目与库存，
            读者在线借阅并归还，每一笔流转都会留下记录。
          </p>
          <div className="flex gap-3">
            <Link href="/" className="btn-primary">
              浏览馆藏
            </Link>
            <Link href="/" className="btn-ghost">
              登录账号
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-sm font-medium text-ink">系统提供</h2>
          <ul className="mt-4 space-y-4 text-sm">
            <li>
              <p className="font-medium text-ink">馆藏检索</p>
              <p className="mt-1 text-ink-soft">
                按书名、作者、ISBN 查找，实时显示可借数量。
              </p>
            </li>
            <li>
              <p className="font-medium text-ink">借阅与归还</p>
              <p className="mt-1 text-ink-soft">
                借出时扣减库存，归还时回填，逾期会单独标记。
              </p>
            </li>
            <li>
              <p className="font-medium text-ink">个人借阅记录</p>
              <p className="mt-1 text-ink-soft">
                每位读者只能看到自己的借阅历史。
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section className="border-t border-line pt-8">
        <p className="text-xs uppercase tracking-widest text-ink-faint">
          技术栈
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          {[
            ["Next.js 16", "App Router / Server Actions"],
            ["Prisma 7", "类型安全的数据访问层"],
            ["SQLite", "零配置本地数据库"],
            ["Tailwind CSS 4", "原子化样式"],
          ].map(([name, desc]) => (
            <div key={name} className="card px-4 py-3">
              <p className="font-medium text-ink">{name}</p>
              <p className="mt-1 text-xs text-ink-soft">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
