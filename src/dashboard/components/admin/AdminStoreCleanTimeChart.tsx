import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

export default function AdminStoreCleanTimeChart({
  data,
}: {
  data: { labels: string[]; times: number[] };
}) {
  const list = data.labels
    .map((label, i) => ({
      store: label,
      hours: Number((data.times[i] / 3600).toFixed(1)),
    }))
    .filter((d) => d.hours > 0)
    .sort((a, b) => b.hours - a.hours);

  if (list.length === 0)
    return <p className="text-gray-500">표시할 데이터가 없습니다.</p>;

  const maxHours = Math.max(...list.map((d) => d.hours));

  const getFill = (hours: number) => {
    const ratio = hours / maxHours;
    const start = [244, 243, 234];
    const end = [51, 61, 81];

    const r = Math.round(start[0] + (end[0] - start[0]) * ratio);
    const g = Math.round(start[1] + (end[1] - start[1]) * ratio);
    const b = Math.round(start[2] + (end[2] - start[2]) * ratio);

    return `rgb(${r},${g},${b})`;
  };

  return (
    <div className="w-full h-full relative">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          layout="vertical"
          data={list}
          margin={{ top: 14, right: 64, left: 20 }}
        >
          <CartesianGrid
            horizontal={false}
            strokeDasharray="3 3"
            className="stroke-slate-200"
          />

          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            className="text-slate-700 text-sm"
            tickFormatter={(v) => `${v}h`}
          />

          <YAxis
            type="category"
            dataKey="store"
            width={160}
            tickLine={false}
            axisLine={false}
            className="text-slate-700 text-sm"
          />

          <Tooltip
            formatter={(v: number) => [`${v} 시간`, "청소 시간"]}
            cursor={{ fill: "rgba(241,245,249,0.8)" }}
          />

          <Bar dataKey="hours" barSize={28} radius={[0, 10, 10, 0]}>
            {list.map((d, idx) => (
              <Cell key={idx} fill={getFill(d.hours)} />
            ))}
            <LabelList
              dataKey="hours"
              position="right"
              className="fill-slate-700 text-xs"
              formatter={(v) => `${v}h`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
