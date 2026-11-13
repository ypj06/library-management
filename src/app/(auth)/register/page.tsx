import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "注册" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="card p-8">
      <h1 className="text-xl font-semibold text-ink">创建账号</h1>
      <p className="mt-1 mb-6 text-sm text-ink-soft">
        注册后即可在线借阅馆藏图书。
      </p>

      <RegisterForm />

      <p className="mt-6 text-sm text-ink-soft">
        已有账号？
        <Link
          href="/login"
          className="ml-1 font-medium text-brand-700 hover:underline"
        >
          去登录
        </Link>
      </p>
    </div>
  );
}
