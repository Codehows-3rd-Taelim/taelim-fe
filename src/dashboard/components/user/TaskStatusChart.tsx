import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { DailyTaskStatus } from "../../../type";

export default function TaskStatusChart({ data }: { data: DailyTaskStatus }) {
  const chartData = data.labels.map((lbl, idx) => ({
    label: lbl,
    success: data.success[idx] ?? 0,
    manual: data.manual[idx] ?? 0,
    fail: data.fail[idx] ?? 0,
  }));
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="success" stackId="a" fill="#1976d2" />
          <Bar dataKey="manual" stackId="a" fill="#f59e0b" />
          <Bar dataKey="fail" stackId="a" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}