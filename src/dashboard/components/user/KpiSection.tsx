import React from "react";
import type { Performance } from "../../../type";

const Card: React.FC<{ title: string; value: string | number; sub?: string }> = ({ title, value, sub }) => (
  <div className="bg-white p-4 rounded-xl shadow flex flex-col justify-between">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-2xl font-bold mt-2">{value}</div>
    {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
  </div>
);

export default function KpiSection({ performance }: { performance: Performance }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <Card
        title="청소 시간"
        value={`${performance.laborTimeSaving.toLocaleString()} h`}
      />

      <Card
        title="청소 작업 수"
        value={`${performance.taskCount.toLocaleString()} 회`}
      />

      <Card
        title="전력 소비"
        value={`${performance.powerConsumption?.toLocaleString() ?? 0} kWh`}
      />

      <Card
        title="물 소비량"
        value={`${performance.waterConsumption?.toLocaleString() ?? 0} L`}
      />
    </div>
  );
}
