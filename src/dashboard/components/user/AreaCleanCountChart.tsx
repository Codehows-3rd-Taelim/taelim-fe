import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { AreaCleanCount } from "../../../type";

export default function AreaCleanCountChart({ data }: { data: AreaCleanCount }) {
  const chartData = data.areaNames.map((name, idx) => ({ name, value: data.cleanCounts[idx] ?? 0 }));
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}