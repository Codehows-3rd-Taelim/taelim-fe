import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import type { RobotTopTime } from "../../../type";

interface Props {
  data: RobotTopTime[];
}

export default function AdminRobotTopChart({ data }: Props) {
  const topData = [...data].sort((a, b) => b.workTime - a.workTime).slice(0, 5);

  const maxTime = Math.max(...topData.map((d) => d.workTime));
  const minTime = Math.min(...topData.map((d) => d.workTime));

  const getYellowShade = (value: number) => {
    if (maxTime === minTime) return "#D3AC2B";

    const ratio = (value - minTime) / (maxTime - minTime);

    const yellowShades: Record<number, string> = {
 200: "#FFF3BF",
  300: "#FFE066",
  400: "#FCC419",
  500: "#E6B800",
    };

    const shadeKeys = [200, 300, 400, 500];
    const scaledIndex = ratio * (shadeKeys.length - 1);
    const lowerIndex = Math.floor(scaledIndex);
    const upperIndex = Math.ceil(scaledIndex);
    const t = scaledIndex - lowerIndex;

    const hexToRgb = (hex: string) =>
      hex
        .replace("#", "")
        .match(/.{2}/g)!
        .map((x) => parseInt(x, 16));

    const rgbL = hexToRgb(yellowShades[shadeKeys[lowerIndex]]);
    const rgbU = hexToRgb(yellowShades[shadeKeys[upperIndex]]);

    const rgb = rgbL.map((c, i) => Math.round(c + (rgbU[i] - c) * t));

    return `rgb(${rgb.join(",")})`;
  };

  return (
    <ResponsiveContainer width="100%" height={420}>
      <BarChart
        data={topData}
        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="robotName"
          angle={-45}
          textAnchor="end"
          interval={0}
          height={70}
          className="text-sm fill-gray-600"
        />

        <YAxis
          tickFormatter={(v) => `${(v / 60).toFixed(0)}h`}
          className="text-sm fill-gray-600"
        />

        <Tooltip
          formatter={(v: number) => `${(v / 60).toFixed(1)} 시간`}
          labelFormatter={(label) => `로봇: ${label}`}
        />

        <Bar dataKey="workTime" radius={[8, 8, 0, 0]} barSize={70}>
          {topData.map((d, idx) => (
            <Cell key={idx} fill={getYellowShade(d.workTime)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
