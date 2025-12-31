import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import type { LabelProps } from "recharts";
import type { StoreStatusCount } from "../../../type";

const STATUS_COLORS: Record<StoreStatusCount["status"], string> = {
  ACTIVE: "#22c55e",
  INACTIVE: "#9ca3af",
  ERROR: "#ef4444",
};

const STATUS_LABELS: Record<StoreStatusCount["status"], string> = {
  ACTIVE: "정상",
  INACTIVE: "비활성",
  ERROR: "장애",
};
type CenterViewBox = {
  cx: number;
  cy: number;
};

function CenterLabel(props: LabelProps & { value: number }) {
  const viewBox = props.viewBox as CenterViewBox | undefined;
  if (!viewBox) return null;

  const { cx, cy } = viewBox;

  return (
    <g>
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        className="fill-gray-400 text-sm"
      >
        전체 매장
      </text>
      <text
        x={cx}
        y={cy + 18}
        textAnchor="middle"
        className="fill-gray-900 text-2xl font-bold"
      >
        {props.value}
      </text>
    </g>
  );
}

interface Props {
  data: StoreStatusCount[];
}

export default function AdminStoreStatusDonut({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

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
          outerRadius={130}
          label={false}
        >
          <Label content={<CenterLabel value={total} />} />

          {data.map((d, idx) => (
            <Cell key={idx} fill={STATUS_COLORS[d.status]} />
          ))}
        </Pie>

        <Tooltip
          formatter={(value, name) => [
            value,
            STATUS_LABELS[name as StoreStatusCount["status"]],
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
