import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

import { logoutAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "书阁 · 图书借阅管理系统",
    template: "%s · 书阁",
  },
  description: "基于 Next.js + Prisma 的图书借阅管理系统，支持馆藏管理、借阅与归还。",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 在布局里读一次当前用户，头部导航就能随登录状态变化。
  // 同一请求内 getCurrentUser 被 cache 包裹，页面里再调用不会重复查库。
  const user = await getCurrentUser();

  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-line bg-white/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-lg font-semibold tracking-tight text-brand-700">
                书阁
              </span>
              <span className="hidden text-xs text-ink-faint sm:inline">
                图书借阅管理
              </span>
            </Link>

            <nav className="flex items-center gap-5 text-sm text-ink-soft">
              <Link href="/" className="transition-colors hover:text-brand-700">
                馆藏
              </Link>

              {user ? (
                <div className="flex items-center gap-3">
                  <span className="hidden text-ink-faint sm:inline">
                    {user.name}
                  </span>
                  <form action={logoutAction}>
                    <button type="submit" className="transition-colors hover:text-clay-600">
                      退出
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="transition-colors hover:text-brand-700"
                  >
                    登录
                  </Link>
                  <Link href="/register" className="btn-primary">
                    注册
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
          {children}
        </main>

        <footer className="border-t border-line py-6">
          <div className="mx-auto w-full max-w-5xl px-6 text-xs text-ink-faint">
            书阁 · Web 开发课程作业 · Next.js + Prisma + SQLite
          </div>
        </footer>
      </body>
    </html>
  );
}
