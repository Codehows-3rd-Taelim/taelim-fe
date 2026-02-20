import { useSyncProgress } from "../hooks/useSyncProgress";

export default function SyncPage() {
  const { state, syncError, startSync } = useSyncProgress();
  const { running, completed, total, percent, savedCount } = state;

  return (
    <div className="w-full h-full flex justify-center bg-gray-100 pb-6">
      <div className="w-full max-w-[1400px] flex flex-col px-4 pt-2">
        {/* 헤더 */}
        <h2 className="font-bold text-lg my-5 ml-6">전체 매장 6개월 보고서 데이터 동기화</h2>

        {/* 콘텐츠 */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <button
            disabled={running}
            onClick={startSync}
            className={`
              px-6 py-3
              text-base font-semibold
              text-white
              rounded-lg
              transition
              ${
                running
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#4A607A] hover:bg-[#324153]"
              }
            `}
          >
            {running ? "동기화 진행 중..." : "6개월 보고서 데이터 동기화"}
          </button>

          {/* 진행률 바 */}
          {running && (
            <div className="w-full max-w-md space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{completed} / {total} 매장 완료</span>
                <span>{percent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-[#4A607A] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}

          {/* 완료 메시지 */}
          {!running && savedCount > 0 && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded">
              동기화 완료 — 저장된 보고서 {savedCount}건
            </p>
          )}

          {/* 에러 메시지 (이미 실행 중 포함) */}
          {syncError && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-2 rounded">
              {syncError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
