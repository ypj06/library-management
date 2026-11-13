"use client";

import { deleteBookAction } from "@/app/actions/books";

export function DeleteBookButton({ id, title }: { id: string; title: string }) {
  return (
    <form action={deleteBookAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="btn-danger px-2.5 py-1 text-xs"
        onClick={(event) => {
          // 删除不可撤销，提交前先确认
          if (!window.confirm(`确定删除《${title}》吗？该书的借阅记录会一并删除。`)) {
            event.preventDefault();
          }
        }}
      >
        删除
      </button>
    </form>
  );
}
