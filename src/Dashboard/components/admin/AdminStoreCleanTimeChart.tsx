import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function AdminStoreCleanTimeChart({
  data,
}: {
  data: { labels: string[]; times: number[] };
}) {
  const list = data.labels.map((label, i) => ({
    store: label,
    hours: Number((data.times[i] / 3600).toFixed(1)),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={list} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="store" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="hours" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}