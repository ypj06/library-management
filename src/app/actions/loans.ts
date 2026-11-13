"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ROLE } from "@/lib/roles";

/** 借阅期限（天） */
const LOAN_DAYS = 30;
/** 单个读者可同时持有的上限 */
const MAX_ACTIVE_LOANS = 5;

export type BorrowError =
  | "notfound"
  | "already"
  | "unavailable"
  | "limit"
  | "failed";

/**
 * 借书。
 *
 * 关键点：库存检查和写入必须放在同一个事务里。
 * 如果先 count 再 create，两次数据库操作之间存在间隙，
 * 两个读者同时借最后一本时都会看到"还有 1 本"，导致超借。
 */
export async function borrowBookAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const bookId = String(formData.get("bookId") ?? "");
  if (!bookId) redirect("/?error=notfound");

  const result = await prisma.$transaction(async (tx) => {
    const book = await tx.book.findUnique({
      where: { id: bookId },
      select: { totalCopies: true },
    });
    if (!book) return { error: "notfound" as const };

    // 同一本书不允许重复借阅（未归还的情况下）
    const duplicate = await tx.loan.findFirst({
      where: { bookId, userId: user.id, returnedAt: null },
      select: { id: true },
    });
    if (duplicate) return { error: "already" as const };

    const activeCount = await tx.loan.count({
      where: { userId: user.id, returnedAt: null },
    });
    if (activeCount >= MAX_ACTIVE_LOANS) return { error: "limit" as const };

    const onLoan = await tx.loan.count({
      where: { bookId, returnedAt: null },
    });
    if (onLoan >= book.totalCopies) {
      return { error: "unavailable" as const };
    }

    await tx.loan.create({
      data: {
        userId: user.id,
        bookId,
        dueAt: new Date(Date.now() + LOAN_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    return { ok: true as const };
  });

  revalidatePath("/");
  revalidatePath("/my-loans");

  if ("error" in result) redirect(`/?error=${result.error}`);
  redirect("/my-loans?ok=borrowed");
}

/**
 * 还书。只有借阅人本人可以归还；管理员可代读者归还。
 */
export async function returnBookAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const loanId = String(formData.get("loanId") ?? "");
  if (!loanId) redirect("/my-loans?error=notfound");

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    select: { id: true, userId: true, returnedAt: true },
  });

  if (!loan) redirect("/my-loans?error=notfound");
  if (loan.userId !== user.id && user.role !== ROLE.ADMIN) {
    redirect("/my-loans?error=forbidden");
  }
  if (loan.returnedAt) redirect("/my-loans?error=returned");

  await prisma.loan.update({
    where: { id: loanId },
    data: { returnedAt: new Date() },
  });

  revalidatePath("/");
  revalidatePath("/my-loans");
  redirect("/my-loans?ok=returned");
}
