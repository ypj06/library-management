import type { Metadata } from "next";
import Link from "next/link";

import { returnBookAction } from "@/app/actions/loans";
import { Notice } from "@/components/notice";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { daysUntil, formatDate, overdueDays } from "@/lib/format";

export const metadata: Metadata = { title: "我的借阅" };

const OK_MESSAGES: Record<string, string> = {
  borrowed: "借阅成功，请在 30 天内归还。",
  returned: "已确认归还，感谢爱护图书。",
};

const ERROR_MESSAGES: Record<string, string> = {
  notfound: "找不到这条借阅记录。",
  forbidden: "只能归还自己借阅的图书。",
  returned: "这本书已经归还过了。",
};

export default async function MyLoansPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await requireUser();
  const { ok, error } = await searchParams;

  const [active, history] = await Promise.all([
    prisma.loan.findMany({
      where: { userId: user.id, returnedAt: null },
      orderBy: { dueAt: "asc" },
      include: {
        book: { select: { id: true, title: true, author: true } },
      },
    }),
    prisma.loan.findMany({
      where: { userId: user.id, returnedAt: { not: null } },
      orderBy: { returnedAt: "desc" },
      take: 10,
      include: {
        book: { select: { id: true, title: true, author: true } },
      },
    }),
  ]);

  const okText = ok ? OK_MESSAGES[ok] : undefined;
  const errorText = error ? ERROR_MESSAGES[error] : undefined;

  return (
    <div className="space-y-8">
      {okText ? <Notice text={okText} tone="ok" /> : null}
      {errorText ? <Notice text={errorText} tone="error" /> : null}

      <div>
        <h1 className="text-2xl font-semibold text-ink">我的借阅</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {user.name} · 当前在借 {active.length} 本
        </p>
      </div>

      <section className="space-y-3">
        {active.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-sm text-ink-soft">还没有借书。</p>
            <Link
              href="/"
              className="mt-4 inline-flex text-sm font-medium text-brand-700 hover:underline"
            >
              去馆藏看看 →
            </Link>
          </div>
        ) : (
          active.map((loan) => {
            const overdue = overdueDays(loan.dueAt);
            const remaining = daysUntil(loan.dueAt);

            return (
              <article
                key={loan.id}
                className="card flex flex-wrap items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-medium text-ink">
                      {loan.book.title}
                    </h2>
                    {overdue > 0 ? (
                      <span className="shrink-0 rounded-full bg-clay-50 px-2 py-0.5 text-[11px] text-clay-600">
                        逾期 {overdue} 天
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] text-brand-700">
                        还剩 {remaining} 天
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-ink-soft">
                    {loan.book.author} · 借出 {formatDate(loan.borrowedAt)} ·
                    应还 {formatDate(loan.dueAt)}
                  </p>
                </div>

                <form action={returnBookAction}>
                  <input type="hidden" name="loanId" value={loan.id} />
                  <button type="submit" className="btn-ghost px-3 py-1.5 text-xs">
                    归还
                  </button>
                </form>
              </article>
            );
          })
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-ink-soft">最近归还</h2>

        {history.length === 0 ? (
          <p className="text-sm text-ink-faint">暂无归还记录。</p>
        ) : (
          <div className="card divide-y divide-line">
            {history.map((loan) => (
              <div
                key={loan.id}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <span className="truncate text-ink">{loan.book.title}</span>
                <span className="shrink-0 text-xs text-ink-faint">
                  {formatDate(loan.borrowedAt)} —{" "}
                  {loan.returnedAt ? formatDate(loan.returnedAt) : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
