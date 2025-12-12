import type { Performance } from "../../../type";

type Props = {
  performance: Performance;
  hourlyWage: number;
  setHourlyWage: (wage: number) => void;
};

export default function PerformanceCards({ performance, hourlyWage, setHourlyWage }: Props) {
  return (
    <>
      {/* 청소 비용 절감 + 인건비 */}
      <div className="p-4 border rounded flex flex-col">
        <div className="text-sm text-gray-500">청소 비용 절감</div>
        <div className="text-2xl font-bold mt-2">{performance.costSaving.toLocaleString()} 원</div>

        {/* 인건비 입력 */}
        <div className="flex items-center justify-center gap-2 mt-auto pt-3">
          <label className="text-xs text-gray-600 whitespace-nowrap">인건비(시급)</label>
          <input
            type="number"
            value={hourlyWage}
            onChange={(e) => setHourlyWage(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm w-24 text-center"
            min="0"
          />
          <span className="text-xs text-gray-500">원</span>
        </div>
      </div>

      {/* 노동 시간 절감 */}
      <div className="p-4 border rounded flex flex-col">
        <div className="text-sm text-gray-500">노동 시간 절감</div>
        <div className="text-2xl font-bold mt-2">{performance.laborTimeSaving} h</div>
        <div className="text-xs text-gray-400 mt-auto pt-3">
          = 직원 1명이 약 {(performance.laborTimeSaving / 24).toFixed(1)}일 동안 일한 시간
        </div>
      </div>

      {/* 탄소 배출 절감 */}
      <div className="p-4 border rounded flex flex-col">
        <div className="text-sm text-gray-500">탄소 배출 절감</div>
        <div className="text-2xl font-bold mt-2">{performance.co2Reduction} kg</div>
        <div className="text-xs text-gray-400 mt-auto pt-3">
          = 1.5t 차량 {(performance.co2Reduction / 1.5).toFixed(1)}일 배출량
        </div>
      </div>

      {/* 절수량 */}
      <div className="p-4 border rounded flex flex-col">
        <div className="text-sm text-gray-500">절수량</div>
        <div className="text-2xl font-bold mt-2">{performance.waterSaving} L</div>
        <div className="text-xs text-gray-400 mt-auto pt-3">
          = 약 {Math.round(performance.waterSaving / 0.5)}병 (500ml 기준)
        </div>
      </div>
    </>
  );
}