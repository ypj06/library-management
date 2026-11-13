import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

import { DeleteBookButton } from "./delete-book-button";

export const metadata: Metadata = { title: "图书管理" };

export default async function AdminBooksPage() {
  await requireAdmin();

  // 只取"未归还"的借阅记录，用来算可借数量
  const books = await prisma.book.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      loans: { where: { returnedAt: null }, select: { id: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">图书管理</h1>
          <p className="mt-1 text-sm text-ink-soft">
            共 {books.length} 种图书，管理馆藏信息与库存数量
          </p>
        </div>
        <Link href="/admin/books/new" className="btn-primary">
          新增图书
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm text-ink-soft">还没有图书，先新增一本吧。</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-line bg-paper-deep/50 text-left text-xs text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-medium">书名 / 作者</th>
                  <th className="px-4 py-3 font-medium">分类</th>
                  <th className="px-4 py-3 font-medium">ISBN</th>
                  <th className="px-4 py-3 font-medium">可借 / 馆藏</th>
                  <th className="px-4 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => {
                  const available = book.totalCopies - book.loans.length;

                  return (
                    <tr
                      key={book.id}
                      className="border-b border-line last:border-0"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">{book.title}</p>
                        <p className="mt-0.5 text-xs text-ink-soft">
                          {book.author}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{book.category}</td>
                      <td className="px-4 py-3 text-xs text-ink-faint">
                        {book.isbn ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            available > 0 ? "text-brand-700" : "text-clay-600"
                          }
                        >
                          {available}
                        </span>
                        <span className="text-ink-faint"> / {book.totalCopies}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/books/${book.id}/edit`}
                            className="btn-ghost px-2.5 py-1 text-xs"
                          >
                            编辑
                          </Link>
                          <DeleteBookButton id={book.id} title={book.title} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
