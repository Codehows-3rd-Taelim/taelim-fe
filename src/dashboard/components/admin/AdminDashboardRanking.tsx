// AdminDashboardRanking.tsx

import type {
  OperationRateScatterChartData,
  StoreSummary,
} from "../../../type";

type Props = {
  storeSummaries: StoreSummary[];
  operationRateData: OperationRateScatterChartData;
};

export default function AdminDashboardRanking({ operationRateData }: Props) {
  // 2️ 가동률 최하위 5
  const avgRates = operationRateData.stores.map((store, idx) => {
    const totalRate = operationRateData.rates[idx].reduce((s, r) => s + r, 0);
    const avgRate = totalRate / (operationRateData.rates[idx].length || 1);
    return { store, avgRate };
  });
  const bottomOperationRate = avgRates
    .sort((a, b) => a.avgRate - b.avgRate)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 가동률 TOP 5 */}
      <div className="bg-white p-6 rounded-xl shadow-xl">
        <h2 className="text-xl font-semibold mb-4">가동률 우수 매장</h2>

        <ol className="space-y-4">
          {operationRateData.stores
            .map((store, idx) => {
              const totalRate = operationRateData.rates[idx].reduce(
                (s, r) => s + r,
                0
              );
              const avgRate =
                totalRate / (operationRateData.rates[idx].length || 1);
              return { store, avgRate };
            })
            .sort((a, b) => b.avgRate - a.avgRate)
            .slice(0, 5)
            .map((s, idx) => (
              <li key={s.store} className="space-y-2">
                <div className="flex justify-between text-lg font-medium">
                  <span>
                    {idx + 1}. {s.store}
                  </span>
                  <span>{s.avgRate.toFixed(1)}%</span>
                </div>

                {/* progress bar */}
                <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-green-400 to-green-200 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(s.avgRate, 100)}%` }}
                  />
                </div>
              </li>
            ))}
        </ol>
      </div>

      {/* 가동률 최하위 5 */}
      <div className="bg-white p-6 rounded-xl shadow-xl">
        <h2 className="text-xl font-semibold mb-4">가동률 저조 매장</h2>

        <ol className="space-y-4">
          {bottomOperationRate.map((s, idx) => {
            const dangerRate = Math.max(0, 100 - s.avgRate);

            return (
              <li key={s.store} className="space-y-2">
                <div className="flex justify-between text-lg font-medium">
                  <span>
                    {idx + 1}. {s.store}
                  </span>
                  <span>{s.avgRate.toFixed(1)}%</span>
                </div>

                {/* inverted progress bar */}
                <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-red-300 to-red-300 rounded-full transition-all duration-500"
                    style={{ width: `${dangerRate}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
