import type { Metadata } from "next";
import Link from "next/link";

import { borrowBookAction } from "@/app/actions/loans";
import { Notice } from "@/components/notice";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "馆藏 · 书阁",
};

const OK_MESSAGES: Record<string, string> = {
  borrowed: "借阅成功，请在 30 天内归还。",
};

const ERROR_MESSAGES: Record<string, string> = {
  notfound: "找不到这本书，可能已被删除。",
  already: "你已经借了这本书，归还后才能再次借阅。",
  unavailable: "这本书暂时没有可借的副本。",
  limit: "同时最多借阅 5 本，请先归还一本。",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const [{ ok, error }, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);

  const books = await prisma.book.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      loans: { where: { returnedAt: null }, select: { id: true } },
    },
  });

  const okText = ok ? OK_MESSAGES[ok] : undefined;
  const errorText = error ? ERROR_MESSAGES[error] : undefined;

  return (
    <div className="space-y-10">
      {okText ? <Notice text={okText} tone="ok" /> : null}
      {errorText ? <Notice text={errorText} tone="error" /> : null}

      <section className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
        <div className="space-y-4">
          <p className="inline-flex items-center rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            馆藏 {books.length} 种 · 在线借阅
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
          {user ? (
            <Link href="/my-loans" className="btn-ghost">
              查看我的借阅
            </Link>
          ) : (
            <div className="flex gap-3">
              <Link href="/login" className="btn-primary">
                登录后借阅
              </Link>
              <Link href="/register" className="btn-ghost">
                注册账号
              </Link>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-sm font-medium text-ink">借阅规则</h2>
          <ul className="mt-4 space-y-3 text-sm text-ink-soft">
            <li>· 每本书借期 30 天，逾期会单独标记</li>
            <li>· 同一本书未归还时不能重复借阅</li>
            <li>· 同时最多持有 5 本</li>
            <li>· 逾期不影响归还，但请尽早处理</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold text-ink">全部馆藏</h2>
          <span className="text-xs text-ink-faint">
            按上架时间排序
          </span>
        </div>

        {books.length === 0 ? (
          <div className="card p-12 text-center text-sm text-ink-soft">
            馆藏还是空的。
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => {
              const available = book.totalCopies - book.loans.length;

              return (
                <article
                  key={book.id}
                  className="card flex flex-col p-4 transition-colors hover:border-brand-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-medium leading-6 text-ink">
                      {book.title}
                    </h3>
                    <span className="shrink-0 rounded-full bg-paper-deep px-2 py-0.5 text-[11px] text-ink-soft">
                      {book.category}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-ink-soft">{book.author}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-ink-faint">
                    {book.summary ?? "暂无简介"}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-xs">
                      {available > 0 ? (
                        <span className="text-brand-700">
                          可借 {available}
                        </span>
                      ) : (
                        <span className="text-clay-600">已借完</span>
                      )}
                      <span className="text-ink-faint"> / {book.totalCopies}</span>
                    </span>

                    {user ? (
                      <form action={borrowBookAction}>
                        <input type="hidden" name="bookId" value={book.id} />
                        <button
                          type="submit"
                          className="btn-primary px-3 py-1 text-xs"
                          disabled={available <= 0}
                        >
                          借阅
                        </button>
                      </form>
                    ) : (
                      <Link
                        href="/login"
                        className="text-xs text-brand-700 hover:underline"
                      >
                        登录后借阅
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
