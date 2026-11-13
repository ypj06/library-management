import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateBookAction } from "@/app/actions/books";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

import { BookForm } from "../../book-form";

export const metadata: Metadata = { title: "编辑图书" };

export default async function EditBookPage({
  params,
}: {
  // Next.js 15 起 params 是 Promise，需要先 await
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const book = await prisma.book.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      author: true,
      isbn: true,
      category: true,
      publisher: true,
      publishYear: true,
      summary: true,
      totalCopies: true,
    },
  });

  if (!book) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/books"
          className="text-sm text-ink-soft hover:text-brand-700"
        >
          ← 返回图书管理
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-ink">编辑图书</h1>
        <p className="mt-1 text-sm text-ink-soft">{book.title}</p>
      </div>

      <BookForm
        action={updateBookAction}
        book={book}
        submitLabel="保存修改"
      />
    </div>
  );
}
