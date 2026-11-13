import type { Metadata } from "next";
import Link from "next/link";

import { createBookAction } from "@/app/actions/books";
import { requireAdmin } from "@/lib/auth";

import { BookForm } from "../book-form";

export const metadata: Metadata = { title: "新增图书" };

export default async function NewBookPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/books"
          className="text-sm text-ink-soft hover:text-brand-700"
        >
          ← 返回图书管理
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-ink">新增图书</h1>
        <p className="mt-1 text-sm text-ink-soft">
          带 * 的为必填项，其余可留空。
        </p>
      </div>

      <BookForm action={createBookAction} submitLabel="保存图书" />
    </div>
  );
}
