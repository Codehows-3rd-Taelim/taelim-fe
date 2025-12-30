import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { StoreStatusCount } from "../../../type";

interface Props {
  data: StoreStatusCount[];
}

export default function AdminStoreStatusDonut({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={150}
          label
        >
          {data.map((_, idx) => (
            <Cell key={idx} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
