import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";

export default function AdminStoreCleanAreaChart({
  data,
}: {
  data: { labels: string[]; areas: number[] };
}) {
  const list = data.labels
    .map((label, i) => ({
      store: label,
      area: data.areas[i],
    }))
    .filter((item) => item.area > 0)
    .sort((a, b) => b.area - a.area);

  if (list.length === 0)
    return <p className="text-gray-500">표시할 데이터가 없습니다.</p>;

  const maxArea = Math.max(...list.map((d) => d.area));

  const getFill = (area: number) => {
    const ratio = area / maxArea;
    const start = [244, 243, 234];
    const end = [163, 172, 91];

    const r = Math.round(start[0] + (end[0] - start[0]) * ratio);
    const g = Math.round(start[1] + (end[1] - start[1]) * ratio);
    const b = Math.round(start[2] + (end[2] - start[2]) * ratio);

    return `rgb(${r},${g},${b})`;
  };

  return (
    <div className="w-full h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={list}
          margin={{ left: 20, right: 64, bottom: 60, top: 14 }}
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
            className="text-slate-400 text-xs"
            label={{
              value: "청소 면적 (m²)",
              position: "insideBottom",
              offset: -20,
              className: "fill-slate-400 text-xs",
            }}
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
            formatter={(v: number) => [`${v.toLocaleString()} m²`, "청소 면적"]}
            cursor={{ fill: "rgba(241,245,249,0.8)" }}
          />

          <Bar dataKey="area" barSize={28} radius={[0, 10, 10, 0]}>
            {list.map((d, idx) => (
              <Cell key={idx} fill={getFill(d.area)} />
            ))}
            <LabelList
              dataKey="area"
              position="right"
              className="fill-slate-700 text-xs"
              formatter={(value) =>
                typeof value === "number" ? value.toLocaleString() : value
              }
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
