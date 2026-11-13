"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { BookFormState } from "@/app/actions/books";

export type BookDefaults = {
  id?: string;
  title: string;
  author: string;
  isbn: string | null;
  category: string;
  publisher: string | null;
  publishYear: number | null;
  summary: string | null;
  totalCopies: number;
};

type Props = {
  // Server Action 可以直接作为 props 传给客户端组件
  action: (
    state: BookFormState,
    formData: FormData,
  ) => Promise<BookFormState>;
  book?: BookDefaults;
  submitLabel: string;
};

const CATEGORY_SUGGESTIONS = ["文学", "科技", "历史", "经济", "艺术"];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "保存中…" : label}
    </button>
  );
}

export function BookForm({ action, book, submitLabel }: Props) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="card space-y-5 p-6">
      {book?.id ? <input type="hidden" name="id" value={book.id} /> : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="title" className="text-sm text-ink-soft">
            书名 <span className="text-clay-600">*</span>
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={100}
            defaultValue={book?.title}
            className="field"
            placeholder="例如：活着"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="author" className="text-sm text-ink-soft">
            作者 <span className="text-clay-600">*</span>
          </label>
          <input
            id="author"
            name="author"
            required
            maxLength={60}
            defaultValue={book?.author}
            className="field"
            placeholder="例如：余华"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="category" className="text-sm text-ink-soft">
            分类 <span className="text-clay-600">*</span>
          </label>
          <input
            id="category"
            name="category"
            required
            list="category-options"
            maxLength={20}
            defaultValue={book?.category}
            className="field"
            placeholder="文学 / 科技 / 历史…"
          />
          <datalist id="category-options">
            {CATEGORY_SUGGESTIONS.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="isbn" className="text-sm text-ink-soft">
            ISBN
          </label>
          <input
            id="isbn"
            name="isbn"
            maxLength={20}
            defaultValue={book?.isbn ?? ""}
            className="field"
            placeholder="可留空"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="publisher" className="text-sm text-ink-soft">
            出版社
          </label>
          <input
            id="publisher"
            name="publisher"
            maxLength={60}
            defaultValue={book?.publisher ?? ""}
            className="field"
            placeholder="可留空"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="publishYear" className="text-sm text-ink-soft">
            出版年份
          </label>
          <input
            id="publishYear"
            name="publishYear"
            type="number"
            min={1000}
            max={new Date().getFullYear()}
            defaultValue={book?.publishYear ?? ""}
            className="field"
            placeholder="可留空"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="totalCopies" className="text-sm text-ink-soft">
            馆藏总量 <span className="text-clay-600">*</span>
          </label>
          <input
            id="totalCopies"
            name="totalCopies"
            type="number"
            min={1}
            max={999}
            required
            defaultValue={book?.totalCopies ?? 1}
            className="field"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="summary" className="text-sm text-ink-soft">
            内容简介
          </label>
          <textarea
            id="summary"
            name="summary"
            rows={3}
            maxLength={300}
            defaultValue={book?.summary ?? ""}
            className="field resize-y"
            placeholder="一两句话介绍这本书"
          />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-md bg-clay-50 px-3 py-2 text-sm text-clay-600">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3 border-t border-line pt-4">
        <SubmitButton label={submitLabel} />
        <Link href="/admin/books" className="btn-ghost">
          取消
        </Link>
      </div>
    </form>
  );
}
