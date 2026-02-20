/**
 * @param cleanTimeSeconds 초 단위 청소 시간
 * @param precision 'full' = 시:분:초 (기본값), 'minutes' = 분만
 * @returns 포매팅된 문자열, 0초이면 "-"
 */
export function formatCleanDuration(
  cleanTimeSeconds: number,
  precision: "full" | "minutes" = "full"
): string {
  const totalSeconds = Math.floor(cleanTimeSeconds);
  if (totalSeconds === 0) return "-";
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (precision === "minutes") return `${totalMinutes} min`;
  return hours === 0
    ? `${totalMinutes}분 ${seconds}초`
    : `${hours}시간 ${minutes}분 ${seconds}초`;
}
