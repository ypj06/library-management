import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "书阁 · 图书借阅管理系统",
    template: "%s · 书阁",
  },
  description: "基于 Next.js + Prisma 的图书借阅管理系统，支持馆藏管理、借阅与归还。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-line bg-white/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-lg font-semibold tracking-tight text-brand-700">
                书阁
              </span>
              <span className="text-xs text-ink-faint">图书借阅管理</span>
            </Link>

            <nav className="flex items-center gap-5 text-sm text-ink-soft">
              <Link href="/" className="transition-colors hover:text-brand-700">
                馆藏
              </Link>
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
