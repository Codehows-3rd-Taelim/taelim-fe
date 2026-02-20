import type { Qna } from "../../type";
import { badgeBase } from "../utils/qnaHelpers";

interface Props {
  q: Qna;
}

export default function StatusBadge({ q }: Props) {
  if (q.deletedAt)
    return <span className={`${badgeBase} bg-black`}>비활성</span>;
  if (!q.resolved)
    return <span className={`${badgeBase} bg-gray-400`}>미처리</span>;
  if (q.status === "APPLIED")
    return <span className={`${badgeBase} bg-blue-500`}>챗봇 적용</span>;
  if (q.status === "FAILED")
    return <span className={`${badgeBase} bg-red-500`}>챗봇 적용 실패</span>;
  return <span className={`${badgeBase} bg-green-600`}>처리</span>;
}
