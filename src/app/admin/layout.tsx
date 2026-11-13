import { requireAdmin } from "@/lib/auth";

/**
 * 管理后台的权限守卫。
 * 放在布局里，所有 /admin/* 页面进入前都会先校验；
 * 各页面内部还会再调用一次 requireAdmin（有 cache，不会重复查库），
 * 避免将来布局结构调整时漏掉校验。
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return <>{children}</>;
}
