import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import type { TaskStatusDonut } from "../../../type";

const STATUS_LABEL: Record<"FINISH" | "INTERRUPT" | "CANCEL", string> = {
  FINISH: "완료",
  INTERRUPT: "중단",
  CANCEL: "취소",
};

const COLORS = {
  FINISH: "#8EC1E6",     // 파랑
  INTERRUPT: "#fff34f",  // 노랑
  CANCEL: "#FBCFE8",     // 핑크
};
function CenterLabel({ total }: { total: number }) {
  return (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
      <tspan x="50%" dy="-0.2em" className="text-sm fill-gray-500">
        총 작업
      </tspan>
      <tspan
        x="50%"
        dy="1em"
        className="text-xl font-bold fill-gray-800"
      >
        {total}
      </tspan>
    </text>
  );
}

function renderPercentLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) {
  if (!percent || percent === 0) return null;

  // 중앙 쪽으로 더 당김
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;

  const radian = Math.PI / 180;
  const x = cx + radius * Math.cos(-midAngle * radian);
  let y = cy + radius * Math.sin(-midAngle * radian);

  // 위/아래 위치 미세 조정
  const verticalOffset = 7; // 조절 포인트
  const sinValue = Math.sin(-midAngle * radian);

  if (sinValue < 0) {
    // 위쪽 조각 → 아래로
    y += verticalOffset;
  } else {
    // 아래쪽 조각 → 위로
    y -= verticalOffset;
  }

  return (
    <text
      x={x}
      y={y}
      fill="#374151"
      textAnchor="middle"
      dominantBaseline="middle"
      className="text-sm font-semibold"
    >
      {(percent * 100).toFixed(1)}%
    </text>
  );
}

interface Props {
  data: TaskStatusDonut[];
}

export default function AdminTaskStatusDonut({ data }: Props) {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 도넛 차트 */}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={110}
            label={renderPercentLabel}
            labelLine={false}
          >
            {data.map((entry, idx) => (
              <Cell key={idx} fill={COLORS[entry.status]} />
            ))}
            <CenterLabel total={total} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* 한글 범례 */}
      <div className="flex gap-6 text-sm">
        {data.map((d) => (
          <div key={d.status} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[d.status] }}
            />
            <span className="text-gray-700">
              {STATUS_LABEL[d.status]} {d.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}