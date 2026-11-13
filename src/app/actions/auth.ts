"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { ROLE } from "@/lib/roles";
import { createSession, destroySession } from "@/lib/session";

export type AuthState = { error?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

/**
 * 登录。
 * 注意：这里故意不区分"用户不存在"和"密码错误"，
 * 统一提示"邮箱或密码不正确"，避免攻击者用报错反推哪些邮箱已注册。
 */
export async function loginAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "请填写邮箱和密码" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.password)) {
    return { error: "邮箱或密码不正确" };
  }

  await createSession(user.id);

  // redirect 内部会抛出特殊异常来中断渲染，必须放在 try/catch 之外
  redirect("/");
}

/**
 * 注册。默认角色是读者；管理员账号由种子数据创建。
 */
export async function registerAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!name) return { error: "请填写昵称" };
  if (!EMAIL_PATTERN.test(email)) return { error: "邮箱格式不正确" };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `密码至少 ${MIN_PASSWORD_LENGTH} 位` };
  }
  if (password !== confirm) return { error: "两次输入的密码不一致" };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "该邮箱已注册，请直接登录" };

  let userId: string;
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword(password),
        role: ROLE.READER,
      },
      select: { id: true },
    });
    userId = user.id;
  } catch {
    // 并发情况下两个请求可能同时通过上面的查重，
    // 此时由数据库的 email 唯一索引兜底，这里转成友好提示。
    return { error: "注册失败，请稍后重试" };
  }

  await createSession(userId);
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
