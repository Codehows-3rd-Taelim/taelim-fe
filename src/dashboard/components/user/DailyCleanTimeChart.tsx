import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DailyChartData } from "../../../type";

export default function DailyCleanTimeChart({
  data,
}: {
  data: DailyChartData;
}) {
  const list = data.labels.map((label, i) => ({
    date: label,
    value: data.myRobots[i],
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={list} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}