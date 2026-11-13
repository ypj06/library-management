import type { Metadata } from "next";
import Link from "next/link";

import { borrowBookAction } from "@/app/actions/loans";
import { Notice } from "@/components/notice";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "馆藏 · 书阁",
};

const PAGE_SIZE = 9;

const OK_MESSAGES: Record<string, string> = {
  borrowed: "借阅成功，请在 30 天内归还。",
};

const ERROR_MESSAGES: Record<string, string> = {
  notfound: "找不到这本书，可能已被删除。",
  already: "你已经借了这本书，归还后才能再次借阅。",
  unavailable: "这本书暂时没有可借的副本。",
  limit: "同时最多借阅 5 本，请先归还一本。",
};

type SearchParams = {
  q?: string;
  category?: string;
  page?: string;
  ok?: string;
  error?: string;
};

/** 拼装查询字符串，保留其余筛选条件。 */
function buildQuery(params: {
  q?: string;
  category?: string;
  page?: number;
}): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  if (params.page && params.page > 1) search.set("page", String(params.page));

  const query = search.toString();
  return query ? `/?${query}` : "/";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);

  const keyword = (params.q ?? "").trim();
  const category = params.category ?? "";
  const requestedPage = Number(params.page ?? "1") || 1;

  // 关键词同时匹配书名、作者、ISBN；分类为精确匹配
  const where = {
    ...(keyword
      ? {
          OR: [
            { title: { contains: keyword } },
            { author: { contains: keyword } },
            { isbn: { contains: keyword } },
          ],
        }
      : {}),
    ...(category ? { category } : {}),
  };

  const [total, categories, onLoanGroups] = await Promise.all([
    prisma.book.count({ where }),
    prisma.book.groupBy({ by: ["category"], _count: { _all: true } }),
    // 统计每本书当前在借数量，用于计算可借数
    prisma.loan.groupBy({
      by: ["bookId"],
      where: { returnedAt: null },
      _count: { _all: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);

  const books = await prisma.book.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const onLoanMap = new Map(
    onLoanGroups.map((item) => [item.bookId, item._count._all]),
  );

  const okText = params.ok ? OK_MESSAGES[params.ok] : undefined;
  const errorText = params.error ? ERROR_MESSAGES[params.error] : undefined;
  const hasFilter = Boolean(keyword || category);

  return (
    <div className="space-y-6">
      {okText ? <Notice text={okText} tone="ok" /> : null}
      {errorText ? <Notice text={errorText} tone="error" /> : null}

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">馆藏</h1>
        <p className="text-sm text-ink-soft">
          共 {total} 种图书。登录后可在线借阅，借期 30 天，同时最多持有 5 本。
        </p>
      </header>

      {/* 用 GET 表单提交，查询条件直接体现在 URL 上，可分享、可后退 */}
      <form method="get" action="/" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={keyword}
          placeholder="搜索书名、作者或 ISBN"
          className="field"
          aria-label="搜索图书"
        />
        {category ? (
          <input type="hidden" name="category" value={category} />
        ) : null}
        <button type="submit" className="btn-primary shrink-0">
          搜索
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildQuery({ q: keyword })}
          className={
            category
              ? "rounded-full border border-line bg-white px-3 py-1 text-xs text-ink-soft hover:border-brand-300"
              : "rounded-full border border-brand-600 bg-brand-600 px-3 py-1 text-xs text-white"
          }
        >
          全部
        </Link>
        {categories.map((item) => {
          const active = category === item.category;
          return (
            <Link
              key={item.category}
              href={buildQuery({ q: keyword, category: item.category })}
              className={
                active
                  ? "rounded-full border border-brand-600 bg-brand-600 px-3 py-1 text-xs text-white"
                  : "rounded-full border border-line bg-white px-3 py-1 text-xs text-ink-soft hover:border-brand-300"
              }
            >
              {item.category}
              <span className={active ? "ml-1 text-white/70" : "ml-1 text-ink-faint"}>
                {item._count._all}
              </span>
            </Link>
          );
        })}
      </div>

      {books.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm text-ink-soft">
            {hasFilter ? "没有找到匹配的图书。" : "馆藏还是空的。"}
          </p>
          {hasFilter ? (
            <Link
              href="/"
              className="mt-4 inline-flex text-sm font-medium text-brand-700 hover:underline"
            >
              清除筛选条件
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => {
            const available = book.totalCopies - (onLoanMap.get(book.id) ?? 0);

            return (
              <article
                key={book.id}
                className="card flex flex-col p-4 transition-colors hover:border-brand-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-medium leading-6 text-ink">{book.title}</h2>
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
                      <span className="text-brand-700">可借 {available}</span>
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

      {totalPages > 1 ? (
        <nav className="flex items-center justify-center gap-2 pt-2" aria-label="分页">
          {currentPage > 1 ? (
            <Link
              href={buildQuery({ q: keyword, category, page: currentPage - 1 })}
              className="btn-ghost px-3 py-1.5 text-xs"
            >
              上一页
            </Link>
          ) : null}

          <span className="px-2 text-xs text-ink-soft">
            第 {currentPage} / {totalPages} 页
          </span>

          {currentPage < totalPages ? (
            <Link
              href={buildQuery({ q: keyword, category, page: currentPage + 1 })}
              className="btn-ghost px-3 py-1.5 text-xs"
            >
              下一页
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
