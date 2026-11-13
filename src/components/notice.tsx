/**
 * 操作结果提示条。借用 URL 上的 ?ok= / ?error= 参数传递结果，
 * 页面刷新后提示会消失，不需要额外的客户端状态。
 */
export function Notice({
  text,
  tone,
}: {
  text: string;
  tone: "ok" | "error";
}) {
  const style =
    tone === "ok"
      ? "border-brand-100 bg-brand-50 text-brand-700"
      : "border-[#ead9cc] bg-clay-50 text-clay-600";

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${style}`}>{text}</div>
  );
}
