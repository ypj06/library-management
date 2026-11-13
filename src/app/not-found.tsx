import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card p-12 text-center">
      <p className="text-xs uppercase tracking-widest text-ink-faint">404</p>
      <h1 className="mt-2 text-xl font-semibold text-ink">这一页不存在</h1>
      <p className="mt-2 text-sm text-ink-soft">
        可能链接输入有误，或者内容已经被删除。
      </p>
      <Link href="/" className="btn-primary mt-6">
        回到馆藏
      </Link>
    </div>
  );
}
