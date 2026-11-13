"use client";

import { useEffect } from "react";

/**
 * 路由级错误边界。
 * 页面渲染或 Server Action 抛出未捕获异常时，Next 会渲染这里，
 * 而不是把整站白屏。
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="card p-10 text-center">
      <h1 className="text-lg font-semibold text-ink">页面出错了</h1>
      <p className="mt-2 text-sm text-ink-soft">
        操作没有完成，可以重试一次；如果仍然失败，请稍后再来。
      </p>
      <button type="button" onClick={reset} className="btn-primary mt-6">
        重试
      </button>
    </div>
  );
}
