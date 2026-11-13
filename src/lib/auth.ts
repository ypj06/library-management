import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { prisma } from "./db";
import { ROLE } from "./roles";
import { readSession } from "./session";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

/**
 * 取当前登录用户，未登录返回 null。
 *
 * 外面套一层 React 的 cache：同一次请求里，Layout、Page、多个组件都调用它时
 * 只会查一次数据库，而不是每个组件查一遍。
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const userId = await readSession();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });

  return user;
});

/** 要求已登录，否则跳转到登录页。 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** 要求管理员权限，普通用户访问时退回首页。 */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== ROLE.ADMIN) redirect("/");
  return user;
}
