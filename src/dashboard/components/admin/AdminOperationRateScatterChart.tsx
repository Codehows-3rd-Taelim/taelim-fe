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

  // 데이터가 있는 매장만 필터링 (모든 날짜가 0이 아닌 매장)
  const storesWithData = stores.filter((store, sIdx) => {
    return rates[sIdx].some((rate) => rate > 0);
  });

  const ratesWithData = rates.filter((rateArray) => {
    return rateArray.some((rate) => rate > 0);
  });

  // 데이터가 있는 매장이 없으면 안내 메시지
  if (storesWithData.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-gray-400">
        가동률 데이터 없음
      </div>
    );
  }

  // LineChart용 데이터 변환
  const chartData = dates.map((date, idx) => {
    const obj: Record<string, string | number> = { date };
    storesWithData.forEach((store, sIdx) => {
      obj[store] = ratesWithData[sIdx][idx] ?? 0;
    });
    return obj;
  });

  const colorsArr = [
    "#FF6B6B", // 강렬한 레드
    "#4ECDC4", // 밝은 터키색
    "#FFE66D", // 밝은 노랑
    "#A8E6CF", // 민트그린
    "#FF8B94", // 코랄핑크
    "#95E1D3", // 아쿠아민트
    "#F38181", // 연어색
    "#AA96DA", // 밝은 퍼플
    "#FCBAD3", // 핫핑크
    "#A8D8EA", // 스카이블루
    "#FD79A8", // 마젠타핑크
    "#74B9FF", // 밝은 블루
    "#55EFC4", // 네온민트
    "#FDCB6E", // 골든옐로우
    "#6C5CE7", // 바이올렛
  ];
  const colors: Record<string, string> = {};
  storesWithData.forEach((store, idx) => {
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

              {storesWithData.map((store) => (
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
          {storesWithData.map((store) => (
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