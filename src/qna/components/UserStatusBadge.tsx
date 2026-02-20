import type { Qna } from "../../type";
import { badgeBase } from "../utils/qnaHelpers";

interface Props {
  q: Qna;
}

export default function UserStatusBadge({ q }: Props) {
  return q.displayAnswer ? (
    <span className={`${badgeBase} bg-green-600`}>답변 완료</span>
  ) : (
    <span className={`${badgeBase} bg-gray-400`}>처리중</span>
  );
}
