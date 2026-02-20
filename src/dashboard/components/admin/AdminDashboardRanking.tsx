import type { OperationRateScatterChartData } from "../../../type";
import { DAY_MINUTES } from "../../../lib/constants";

type Props = {
  operationRateData: OperationRateScatterChartData;
};

export default function AdminDashboardRanking({ operationRateData }: Props) {
  // ✅ 매장별 평균 청소 시간 & 24시간 대비 가동률
  const usageRates = operationRateData.stores.map((store, idx) => {
    const dailyCleanMinutes = operationRateData.rates[idx] || [];
    const totalDays = dailyCleanMinutes.length || 1;

    const avgCleanMinutes =
      dailyCleanMinutes.reduce((sum, m) => sum + m, 0) / totalDays;

    const usageRate = (avgCleanMinutes / DAY_MINUTES) * 100;

    return {
      store,
      avgCleanMinutes,
      usageRate,
    };
  });

  const topUsage = [...usageRates]
    .sort((a, b) => b.avgCleanMinutes - a.avgCleanMinutes)
    .slice(0, 5);

  const bottomUsage = [...usageRates]
    .sort((a, b) => a.avgCleanMinutes - b.avgCleanMinutes)
    .slice(0, 5);

  const renderTimeline = (
    minutes: number,
    color: "blue" | "rose" = "blue"
  ) => {
    const widthPercent = Math.min((minutes / DAY_MINUTES) * 100, 100);

    return (
      <div className="w-full">
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              color === "blue"
                ? "bg-gradient-to-r from-blue-500 to-blue-400"
                : "bg-gradient-to-r from-rose-500 to-rose-400"
            }`}
            style={{ width: `${widthPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0h</span>
          <span>24h</span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ✅ 평균 청소시간 우수 매장 */}
      <div className="bg-white p-6 rounded-xl shadow-xl">
        <h2 className="text-xl font-semibold mb-4">
          평균 청소시간 우수 매장
        </h2>

        <ol className="space-y-5">
          {topUsage.map((s, idx) => (
            <li key={s.store} className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="font-medium text-lg">
                  {idx + 1}. {s.store}
                </span>

                <div className="text-right">
                  <div className="font-semibold">
                    {(s.avgCleanMinutes / 60).toFixed(1)}시간 / 일
                  </div>
                  <div className="text-xs text-gray-400">
                    24시간 기준 {s.usageRate.toFixed(1)}%
                  </div>
                </div>
              </div>

              {renderTimeline(s.avgCleanMinutes, "blue")}
            </li>
          ))}
        </ol>
      </div>

      {/* ✅ 평균 청소시간 저조 매장 */}
      <div className="bg-white p-6 rounded-xl shadow-xl">
        <h2 className="text-xl font-semibold mb-4">
          평균 청소시간 저조 매장
        </h2>

        <ol className="space-y-5">
          {bottomUsage.map((s, idx) => (
            <li key={s.store} className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="font-medium text-lg">
                  {idx + 1}. {s.store}
                </span>

                <div className="text-right">
                  <div className="font-semibold">
                    {(s.avgCleanMinutes / 60).toFixed(1)}시간 / 일
                  </div>
                  <div className="text-xs text-gray-400">
                    24시간 기준 {s.usageRate.toFixed(1)}%
                  </div>
                </div>
              </div>

              {renderTimeline(s.avgCleanMinutes, "rose")}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
