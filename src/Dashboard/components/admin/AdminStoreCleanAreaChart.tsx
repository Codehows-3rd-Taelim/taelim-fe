import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function AdminStoreCleanAreaChart({
  data,
}: {
  data: { labels: string[]; areas: number[] };
}) {
  const list = data.labels.map((label, i) => ({
    store: label,
    area: data.areas[i],
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        layout="vertical"
        data={list}
        margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="store" width={120} />
        <Tooltip />
        <Bar dataKey="area" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}