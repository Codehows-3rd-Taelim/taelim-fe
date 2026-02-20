export const PAGE_SIZE = 10;

export const badgeBase =
  "text-xs px-2 py-0.5 rounded text-white whitespace-nowrap";

export const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(
    2,
    "0"
  )}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export const isBlank = (v: string) => v.trim().length === 0;

// Admin styles
export const textareaClass = (editable: boolean) =>
  `w-full max-w-full box-border border rounded p-2 min-h-24 resize-none ${
    editable
      ? "bg-white border-slate-400"
      : "bg-gray-100 border-gray-200 text-gray-700"
  }`;

export const btn = "px-3 py-1 rounded text-white";
export const btnDisabled =
  "px-3 py-1 rounded bg-gray-300 text-gray-500 cursor-not-allowed";

// User styles
export const inputBase =
  "w-full rounded-md px-3 py-2 focus:outline-none transition";
export const textareaBase =
  "w-full rounded-md px-3 py-2 min-h-24 resize-none focus:outline-none transition";
export const readOnlyStyle = "bg-gray-100 text-gray-800";
export const editableStyle =
  "bg-slate-50 border border-slate-300 focus:ring-2 focus:ring-slate-400";
