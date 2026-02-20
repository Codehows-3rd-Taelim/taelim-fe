import type { QnaViewType } from "../../type";

type ResolvedView = "ALL" | "APPLIED" | "NOT_APPLIED";

interface Props {
  viewType: QnaViewType;
  resolvedView: ResolvedView;
  onViewTypeChange: (v: QnaViewType) => void;
  onResolvedViewChange: (v: ResolvedView) => void;
}

export default function AdminQnaTabBar({
  viewType,
  resolvedView,
  onViewTypeChange,
  onResolvedViewChange,
}: Props) {
  return (
    <div className="flex gap-2 mb-4">
      {(
        [
          ["ALL", "전체"],
          ["UNRESOLVED", "미처리"],
          ["RESOLVED", "처리"],
          ["INACTIVE", "비활성 질문"],
        ] as const
      ).map(([k, label]) => (
        <button
          key={k}
          onClick={() => onViewTypeChange(k)}
          className={`px-3 py-1 rounded ${
            viewType === k ? "bg-slate-700 text-white" : "bg-gray-200"
          }`}
        >
          {label}
        </button>
      ))}

      {viewType === "RESOLVED" && (
        <select
          value={resolvedView}
          onChange={(e) =>
            onResolvedViewChange(e.target.value as ResolvedView)
          }
          className="ml-3 px-2 py-1 border rounded"
        >
          <option value="ALL">전체</option>
          <option value="APPLIED">챗봇 적용</option>
          <option value="NOT_APPLIED">챗봇 미적용</option>
        </select>
      )}
    </div>
  );
}
