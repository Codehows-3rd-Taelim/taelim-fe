import { useState } from "react";
import { syncAllStoresFullHistorical } from "./syncApi";


export default function SyncData() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="w-full h-full flex justify-center bg-gray-100 pb-6">
      <div className="w-full max-w-[1400px] flex flex-col px-4 pt-2">
        {/* 헤더 */}
        <h2 className="font-bold text-lg my-5 ml-6">전체 매장 6개월 보고서 데이터 동기화</h2>

        {/* 콘텐츠 */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <button
            disabled={loading}
            onClick={async () => {
              if (
                !confirm(
                  "전체 매장 보고서 데이터를 최대 6개월치까지 동기화합니다.\n시간이 오래 걸릴 수 있습니다.\n계속하시겠습니까?"
                )
              ) {
                return;
              }

              try {
                setLoading(true);
                setMessage(null);
                const result = await syncAllStoresFullHistorical();
                setMessage(result);
              } catch (e: any) {
                setMessage(e.message ?? "동기화 실패");
              } finally {
                setLoading(false);
              }
            }}
            className={`
              px-6 py-3
              text-base font-semibold
              text-white
              rounded-lg
              transition
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#4A607A] hover:bg-[#324153]"
              }
            `}
          >
            {loading ? "동기화 진행 중..." : "6개월 보고서 데이터 동기화"}
          </button>

          {message && (
            <div className="text-sm text-gray-700 bg-white px-4 py-2 rounded shadow">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
