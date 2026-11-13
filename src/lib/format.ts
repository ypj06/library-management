const DATE_FORMATTER = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  // 固定时区，避免服务器时区不同导致日期差一天
  timeZone: "Asia/Shanghai",
});

const DAY_MS = 24 * 60 * 60 * 1000;

export function formatDate(date: Date): string {
  return DATE_FORMATTER.format(date);
}

/** 距离应还日期还剩几天（向上取整，今天到期算 0 天）。 */
export function daysUntil(date: Date): number {
  return Math.floor((date.getTime() - Date.now()) / DAY_MS);
}

/** 逾期天数，未逾期返回 0。 */
export function overdueDays(date: Date): number {
  const diff = Date.now() - date.getTime();
  return diff > 0 ? Math.floor(diff / DAY_MS) + 1 : 0;
}
