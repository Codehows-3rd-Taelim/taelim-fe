import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { RobotTopTime } from "../../../type";

interface Props {
  data: RobotTopTime[];
}

export default function AdminRobotTopChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="robotName" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="workTime" />
      </BarChart>
    </ResponsiveContainer>
  );
}
