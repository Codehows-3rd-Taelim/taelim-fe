import type { SyncRecordDTO } from "../../type";
import { fetchWithAuth } from "../../store";
import { endpoints } from "../../api/endpoints";

export interface SyncProgressState {
  running: boolean;
  completed: number;
  total: number;
  percent: number;
  savedCount: number;
  message?: string;
}

/** 응답 에러 처리 공통 헬퍼 */
const throwIfNotOk = async (res: Response, fallbackMsg: string) => {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || fallbackMsg);
  }
};

export const syncNow = async (): Promise<string> => {
  const res = await fetchWithAuth(endpoints.sync.trigger, { method: "POST" });
  await throwIfNotOk(res, "동기화 실패");
  return res.text();
};

// 마지막 동기화 시간
export const getLastSyncTime = async (): Promise<SyncRecordDTO> => {
  const res = await fetchWithAuth(endpoints.sync.last);
  await throwIfNotOk(res, "마지막 동기화 시간 조회 실패");
  return res.json();
};

// POST → SSE stream (SseEmitter 반환)
export function startSyncStream(signal?: AbortSignal): Promise<Response> {
  return fetchWithAuth(
    endpoints.reports.sync,
    { method: "POST", signal }
  );
}

// GET → JSON (새로고침 시 상태 복원용)
export async function getSyncStatus(): Promise<SyncProgressState> {
  const res = await fetchWithAuth(endpoints.reports.syncStatus);
  if (!res.ok) throw new Error("상태 조회 실패");
  return res.json();
}
