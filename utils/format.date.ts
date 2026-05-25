import moment from "moment";
import "moment/locale/vi";

// Định dạng ngày: DD/MM/YYYY (vi) | MM/DD/YYYY (en)
export function formatDate(
  date: moment.MomentInput,
  locale: string,
  fmt?: string
): string {
  const defaultFmt = locale === "vi" ? "DD/MM/YYYY" : "MM/DD/YYYY";
  return moment(date).locale(locale).format(fmt ?? defaultFmt);
}

// Định dạng giờ: HH:mm:ss
export function formatTime(
  date: moment.MomentInput,
  locale: string,
  fmt?: string
): string {
  return moment(date).locale(locale).format(fmt ?? "HH:mm:ss");
}

// Định dạng ngày + giờ
export function formatDateTime(
  date: moment.MomentInput,
  locale: string,
  fmt?: string
): string {
  const defaultFmt = locale === "vi" ? "DD/MM/YYYY HH:mm" : "MM/DD/YYYY HH:mm";
  return moment(date).locale(locale).format(fmt ?? defaultFmt);
}

// Thời gian tương đối: "2 ngày trước", "3 hours ago"...
export function formatRelative(
  date: moment.MomentInput,
  locale: string
): string {
  return moment(date).locale(locale).fromNow();
}
