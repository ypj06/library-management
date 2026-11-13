"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type BookFormState = { error?: string };

const CURRENT_YEAR = new Date().getFullYear();

type BookInput = {
  title: string;
  author: string;
  isbn: string | null;
  category: string;
  publisher: string | null;
  publishYear: number | null;
  summary: string | null;
  totalCopies: number;
};

/**
 * 从表单里取出字段并做校验。
 * 返回 error 时不返回 data，调用方直接展示错误信息。
 */
function parseBookForm(
  formData: FormData,
): { error: string } | { data: BookInput } {
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const isbnRaw = String(formData.get("isbn") ?? "").trim();
  const publisherRaw = String(formData.get("publisher") ?? "").trim();
  const yearRaw = String(formData.get("publishYear") ?? "").trim();
  const summaryRaw = String(formData.get("summary") ?? "").trim();
  const copiesRaw = String(formData.get("totalCopies") ?? "").trim();

  if (!title) return { error: "书名不能为空" };
  if (!author) return { error: "作者不能为空" };
  if (!category) return { error: "请填写分类" };

  const totalCopies = Number(copiesRaw);
  if (!Number.isInteger(totalCopies) || totalCopies < 1) {
    return { error: "馆藏数量必须是大于 0 的整数" };
  }

  let publishYear: number | null = null;
  if (yearRaw) {
    const year = Number(yearRaw);
    if (!Number.isInteger(year) || year < 1000 || year > CURRENT_YEAR) {
      return { error: `出版年份需在 1000 到 ${CURRENT_YEAR} 之间` };
    }
    publishYear = year;
  }

  return {
    data: {
      title,
      author,
      category,
      // 空字符串要转成 null，否则唯一索引会把多个空 ISBN 判为重复
      isbn: isbnRaw || null,
      publisher: publisherRaw || null,
      publishYear,
      summary: summaryRaw || null,
      totalCopies,
    },
  };
}

function toErrorMessage(error: unknown): string {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return "该 ISBN 已被其他图书使用";
  }
  return "保存失败，请稍后重试";
}

export async function createBookAction(
  _prevState: BookFormState,
  formData: FormData,
): Promise<BookFormState> {
  await requireAdmin();

  const parsed = parseBookForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  try {
    await prisma.book.create({ data: parsed.data });
  } catch (error) {
    return { error: toErrorMessage(error) };
  }

  revalidatePath("/");
  revalidatePath("/admin/books");
  redirect("/admin/books");
}

export async function updateBookAction(
  _prevState: BookFormState,
  formData: FormData,
): Promise<BookFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "缺少图书 ID" };

  const parsed = parseBookForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  // 馆藏总量不能小于当前在借数量，否则可借数会变成负数
  const onLoan = await prisma.loan.count({
    where: { bookId: id, returnedAt: null },
  });
  if (parsed.data.totalCopies < onLoan) {
    return {
      error: `当前有 ${onLoan} 本在借，馆藏总量不能少于这个数字`,
    };
  }

  try {
    await prisma.book.update({ where: { id }, data: parsed.data });
  } catch (error) {
    return { error: toErrorMessage(error) };
  }

  revalidatePath("/");
  revalidatePath("/admin/books");
  redirect("/admin/books");
}

/**
 * 删除图书。用于 <form action={...}>，所以签名是 (formData) => Promise<void>。
 * 关联的借阅记录由数据库的 onDelete: Cascade 一并删除。
 */
export async function deleteBookAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/books");

  await prisma.book.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin/books");
  redirect("/admin/books");
}
