import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { DailyCompletionRate } from "../../../type";

export default function CompletionRateChart({ data }: { data: DailyCompletionRate }) {
  const chartData = data.labels.map((lbl, idx) => ({ label: lbl, rate: data.rates[idx] ?? 0 }));
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="rate" stroke="#2563eb" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
