import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { DailyChartData } from "../../../type";

export default function DailyCleanTimeChart({ data }: { data: DailyChartData }) {
  const chartData = data.labels.map((label, idx) => ({ date: label, value: data.myRobots[idx] ?? 0 }));
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}