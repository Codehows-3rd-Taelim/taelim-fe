import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import type { RobotStatus } from "../../../type";

// Tailwind 컬러 사용
const COLORS = [
  "#3b82f6", // 작업중
  "#22c55e", // 대기중
  "#f59e0b", // 충전중
  "#9ca3af"  // 오프라인
];

export default function RobotDonutChart({ data }: { data: RobotStatus }) {
  const pieData = [
    { name: "작업중", value: data.working },
    { name: "대기중", value: data.standby },
    { name: "충전중", value: data.charging },
    { name: "오프라인", value: data.offline }
  ];

  const total = pieData.reduce((sum, i) => sum + i.value, 0);

  // 예시: "구동 중(작업+대기+충전)" 비율
  const active = data.working + data.standby + data.charging;
  const percentage = total > 0 ? Math.round((active / total) * 100) : 0;

  return (
    <div className="w-full h-[260px] relative">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            dataKey="value"
            data={pieData}
            innerRadius={70}
            outerRadius={100}
            // label={(entry) => `${entry.value}대`}
            label={false}
          >
            {pieData.map((entry, idx) => (
              <Cell key={idx} fill={COLORS[idx]} />
            ))}
          </Pie>

          <Tooltip wrapperStyle={{ transform: "translate(40px, 10px)" }} />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            wrapperStyle={{ fontSize: "16px", whiteSpace: "nowrap" }} 
          />
        </PieChart>
      </ResponsiveContainer>

      {/* 도넛 중앙 텍스트 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80%] text-center">
        <div className="text-xl font-bold">{percentage}%</div>
        <div className="text-xs text-gray-500">활성 로봇</div>
      </div>
    </div>
  );
}
