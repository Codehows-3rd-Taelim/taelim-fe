import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { OperationRateScatterChartData } from "../../../type";

type Props = {
  data?: OperationRateScatterChartData;
};

export default function AdminOperationRateLineChart({ data }: Props) {
  if (!data || !data.stores.length || !data.dates.length) {
    return (
      <div className="h-72 flex items-center justify-center text-gray-400">
        가동률 데이터 없음
      </div>
    );
  }

  const { stores, dates, rates } = data;

  const chartData = dates.map((date, idx) => {
    const obj: Record<string, string | number> = { date };
    stores.forEach((store, sIdx) => {
      obj[store] = rates[sIdx][idx] ?? 0;
    });
    return obj;
  });

  const colorsArr = [
    "#9467BD",
    "#8C564B",
    "#E377C2",
    "#7F7F7F",
    "#BCBD22",
    "#17BECF",
    "#1F77B4",
    "#FF7F0E",
    "#2CA02C",
    "#D62728",
  ];
  const colors: Record<string, string> = {};
  stores.forEach((store, idx) => {
    colors[store] = colorsArr[idx % colorsArr.length];
  });

  return (
    <div className="w-full p-4 bg-white rounded-2xl shadow">
      <div className="flex items-center gap-8 h-96">
        {/* 차트 영역 */}
        <div className="flex-1 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis unit="%" />
              <Tooltip formatter={(value: number) => `${value}%`} />

              {stores.map((store) => (
                <Line
                  key={store}
                  type="monotone"
                  dataKey={store}
                  stroke={colors[store]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1500}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 범례 영역 */}
        <div className="flex flex-col justify-center gap-2 pr-4">
          {stores.map((store) => (
            <div key={store} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[store] }}
              />
              <span className="text-sm text-gray-700">{store}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}