import { useState, useCallback, useRef, useEffect } from "react";
import { startSyncStream, getSyncStatus } from "../api/syncApi";
import type { SyncProgressState } from "../api/syncApi";
import { readSseStream } from "../../lib/sseStream";

export type { SyncProgressState };

export function useSyncProgress() {
  const [state, setState] = useState<SyncProgressState>({
    running: false,
    completed: 0,
    total: 0,
    percent: 0,
    savedCount: 0,
  });
  const [syncError, setSyncError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 마운트 시 현재 상태 복원 (새로고침 지원)
  useEffect(() => {
    getSyncStatus()
      .then(setState)
      .catch(() => {}); // 실패 시 초기 상태 유지
  }, []);

  const startSync = useCallback(async () => {
    if (state.running) return;
    const confirmed = window.confirm(
      "전체 매장 보고서 데이터를 최대 6개월치까지 동기화합니다.\n시간이 오래 걸릴 수 있습니다.\n계속하시겠습니까?"
    );
    if (!confirmed) return;

    setSyncError(null);
    abortRef.current = new AbortController();

    try {
      const res = await startSyncStream(abortRef.current.signal);
      if (!res.ok || !res.body) throw new Error("스트림 연결 실패");

      for await (const { event, data } of readSseStream(res)) {
        if (event === "heartbeat") continue;
        const parsed: SyncProgressState = JSON.parse(data);
        setState(parsed);
        if (event === "error" && parsed.message) {
          setSyncError(parsed.message);
        }
        if (event === "complete" || event === "error") break;
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setSyncError(e instanceof Error ? e.message : "동기화 실패");
    } finally {
      abortRef.current = null;
    }
  }, [state.running]);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  return { state, syncError, startSync };
}
