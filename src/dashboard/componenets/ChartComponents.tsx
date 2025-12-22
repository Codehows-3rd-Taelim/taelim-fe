import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Box, Typography, Paper } from "@mui/material";
import type { DailyChartData, RobotStatus } from "../../type";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

interface KpiProps {
  title: string;
  value: number;
  unit: string;
  subText?: string;
}
interface RobotStatusChartProps {
  data: RobotStatus;
}
interface DailyOperationTimeChartProps {
  data: DailyChartData;
}

export const PerformanceKpi: React.FC<KpiProps> = ({
  title,
  value,
  unit,
  subText,
}) => (
  <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
    <Typography variant="body2" color="text.secondary">
      {title}
    </Typography>
    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#007bff" }}>
      {value.toLocaleString()} {unit}
    </Typography>
    {subText && (
      <Typography variant="caption" color="text.disabled">
        {subText}
      </Typography>
    )}
  </Paper>
);

export const RobotStatusChart: React.FC<RobotStatusChartProps> = ({ data }) => {
  const chartData = {
    labels: ["작업중", "대기중", "충전중", "오프라인"],
    datasets: [
      {
        data: [data.working, data.standby, data.charging, data.offline],
        backgroundColor: ["#007bff", "#ffc107", "#28a745", "#dc3545"],
        borderWidth: 0,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "80%",
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
  };
  return (
    <Box sx={{ position: "relative", margin: "20px auto", maxWidth: "200px" }}>
      <Doughnut data={chartData} options={options} />
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", lineHeight: 1 }}>
          {data.working}%
        </Typography>
        <Typography variant="body2" color="text.secondary">
          가동률
        </Typography>
      </Box>
    </Box>
  );
};

export const DailyOperationTimeChart: React.FC<
  DailyOperationTimeChartProps
> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "자사 로봇 배정 가동 시간",
        data: data.myRobots,
        backgroundColor: "rgba(0, 123, 255, 0.7)",
      },
      {
        label: "로봇산업 예상 가동 시간",
        data: data.avgTime,
        backgroundColor: "rgba(255, 99, 132, 0.7)",
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
    scales: { x: { stacked: false }, y: { beginAtZero: true } },
  };
  return (
    <Box sx={{ height: 300 }}>
      <Bar data={chartData} options={options} />
    </Box>
  );
};
