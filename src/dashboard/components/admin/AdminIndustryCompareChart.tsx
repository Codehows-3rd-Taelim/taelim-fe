import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { IndustryStoreCount } from "../../../type";

export default function AdminIndustryCompareChart({
  data,
}: {
  data: IndustryStoreCount[];
}) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 p-4 bg-white rounded-2xl shadow flex items-center justify-center text-gray-400">
        표시할 데이터가 없습니다.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.storeCount)) || 1;

  const getFill = (value: number) => {
    const ratio = value / max;

    // 밝은 #333D51 → 원본 #333D51
    const start = [99, 109, 129]; // 밝은 slate
    const end = [51, 61, 81]; // #333D51

    const r = Math.round(start[0] + (end[0] - start[0]) * ratio);
    const g = Math.round(start[1] + (end[1] - start[1]) * ratio);
    const b = Math.round(start[2] + (end[2] - start[2]) * ratio);

    return `rgb(${r},${g},${b})`;
  };

  return (
    <div className="w-full h-80 p-4 bg-white rounded-2xl shadow">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="industryName" className="text-sm fill-slate-600" />
          <YAxis allowDecimals={false} className="text-sm fill-slate-600" />
          <Tooltip
            formatter={(v: number) => [`${Math.round(v)}개`, "매장 수"]}
            cursor={{ fill: "rgba(241,245,249,0.8)" }}
          />
          <Legend formatter={() => "매장 수 (개)"} />

          <Bar dataKey="storeCount" radius={[8, 8, 0, 0]}>
            {data.map((d, idx) => (
              <Cell key={idx} fill={getFill(d.storeCount)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
