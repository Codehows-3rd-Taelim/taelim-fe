import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { IndustryStoreCount } from "../../../type";

export default function AdminIndustryCompareChart({
  data,
}: {
  data: IndustryStoreCount[];
}) {
  return (
    <div className="w-full h-80 p-4 bg-white rounded-2xl shadow">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="industryName" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="storeCount" name="매장 수" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
