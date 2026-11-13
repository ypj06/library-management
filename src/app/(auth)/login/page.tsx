import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "登录" };

export default async function LoginPage() {
  // 已登录就不必再看登录页
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="card p-8">
      <h1 className="text-xl font-semibold text-ink">欢迎回来</h1>
      <p className="mt-1 mb-6 text-sm text-ink-soft">
        登录后可以借阅图书、查看自己的借阅记录。
      </p>

      <LoginForm />

      <p className="mt-6 text-sm text-ink-soft">
        还没有账号？
        <Link
          href="/register"
          className="ml-1 font-medium text-brand-700 hover:underline"
        >
          注册一个
        </Link>
      </p>

      <div className="mt-6 border-t border-line pt-4 text-xs text-ink-faint">
        演示账号：reader@example.com / reader123
      </div>
    </div>
  );
}
