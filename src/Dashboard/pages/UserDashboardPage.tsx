import { useState } from "react";
import { Box, Paper, Typography } from "@mui/material";

// =======================================================
// 1. 타입 정의
// =======================================================
type RobotStatus = {
  working: number;
  standby: number;
  charging: number;
  offline: number;
};
type Performance = {
  costSaving: number;
  laborTimeSaving: number;
  co2Reduction: number;
  waterSaving: number;
};
type DailyOperationTime = {
  labels: string[];
  myRobots: number[];
  avgTime: number[];
};
export type DashboardData = {
  robotStatus: RobotStatus;
  performance: Performance;
  dailyOperationTime: DailyOperationTime;
  areaCleanCount: {};
  dailyTaskTime: {};
  dailyTaskStatus: {};
  dailyCompletionRate: {};
};

// =======================================================
// 2. Mock Chart/KPI 컴포넌트
// =======================================================

const RobotStatusChart: React.FC<{ data: RobotStatus }> = ({ data }) => (
  <Box
    sx={{
      height: 250,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "#f0f0f0",
    }}
  >
    <Typography variant="body1">RobotStatusChart (파이/도넛 차트)</Typography>
  </Box>
);

const DailyOperationTimeChart: React.FC<{ data: DailyOperationTime }> = ({
  data,
}) => (
  <Box
    sx={{
      height: 250,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "#f0f0f0",
    }}
  >
    <Typography variant="body1">DailyOperationTimeChart (라인 차트)</Typography>
  </Box>
);

const PerformanceKpi: React.FC<{
  title: string;
  value: number;
  unit: string;
  subText: string;
}> = ({ title, value, unit, subText }) => (
  <Box
    sx={{
      border: "1px solid #eee",
      p: 1,
      textAlign: "center",
      bgcolor: "#fff",
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {title}
    </Typography>
    <Typography variant="h5" color="primary.main" fontWeight="bold">
      {value.toLocaleString("ko-KR")} {unit}
    </Typography>
    <Typography variant="caption" color="text.disabled">
      {subText}
    </Typography>
  </Box>
);

// 3. 가상의 초기 데이터
const initialDashboardData: DashboardData = {
  robotStatus: { working: 66, standby: 18, charging: 10, offline: 6 },
  performance: {
    costSaving: 1838000,
    laborTimeSaving: 35.17,
    co2Reduction: 19.11,
    waterSaving: 737.34,
  },
  dailyOperationTime: {
    labels: [
      "2025-11-02",
      "2025-11-03",
      "2025-11-04",
      "2025-11-05",
      "2025-11-06",
      "2025-11-07",
      "2025-11-08",
    ],
    myRobots: [30, 35, 32, 28, 30, 25, 33],
    avgTime: [35, 38, 30, 32, 35, 38, 30],
  },
  areaCleanCount: {},
  dailyTaskTime: {},
  dailyTaskStatus: {},
  dailyCompletionRate: {},
};

// =======================================================
// 4. Mock Table Components
// =======================================================

const RobotListTableMock: React.FC = () => (
  <Box sx={{ width: "100%", overflowX: "auto" }}>
    <table
      style={{
        width: "100%",
        tableLayout: "auto",
        wordBreak: "keep-all",
        minWidth: "800px",
      }}
    >
      <thead>
        <tr style={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}>
          <th style={{ padding: "8px", textAlign: "left" }}>모델</th>{" "}
          <th>SN</th> <th>로봇 별명</th> <th>MAC</th> <th>운영 상태</th>{" "}
          <th>배터리 잔량</th> <th>네트워크 상태</th>
        </tr>
      </thead>
      <tbody>
        {[
          {
            model: "CC1",
            sn: "811155322060022",
            alias: "로봇 1",
            mac: "00:9C:17:25:B0:34",
            status: "작업중",
            battery: "73%",
            network: "온라인",
          },
          {
            model: "MT1",
            sn: "811155322060020",
            alias: "로봇 2",
            mac: "AC:09:29:B8:F7:F0",
            status: "충전중",
            battery: "25%",
            network: "오프라인",
          },
          {
            model: "MT1",
            sn: "811155322060021",
            alias: "로봇 3",
            mac: "AC:09:2E:8B:F7:F0",
            status: "오프라인",
            battery: "39%",
            network: "오프라인",
          },
        ].map((row, index) => (
          <tr
            key={index}
            style={{ borderBottom: "1px solid #eee", textAlign: "center" }}
          >
            <td
              style={{
                padding: "8px",
                display: "flex",
                alignItems: "center",
                textAlign: "left",
              }}
            >
              <img
                src="robot-icon.png"
                alt={row.model}
                width="24"
                height="24"
                style={{ marginRight: "8px" }}
              />
              {row.model}
            </td>
            <td style={{ padding: "8px" }}>{row.sn}</td>{" "}
            <td style={{ padding: "8px" }}>{row.alias}</td>{" "}
            <td style={{ padding: "8px" }}>{row.mac}</td>
            <td
              style={{
                padding: "8px",
                color: row.status === "작업중" ? "#1976d2" : "#888",
              }}
            >
              {row.status}
            </td>
            <td style={{ padding: "8px" }}>{row.battery}</td>
            <td
              style={{
                padding: "8px",
                color: row.network === "온라인" ? "#28a745" : "#dc3545",
              }}
            >
              {row.network}
            </td>
            <td style={{ padding: "8px" }}>{row.location}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Box>
);

// 💡 KpiTable은 이제 사용되지 않으므로 제거하거나 주석 처리했습니다.
// const KpiTable: React.FC<...> = ...

const RobotAndPerformanceFlex: React.FC<{ data: DashboardData }> = ({
  data,
}) => (
  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
    <Paper sx={{ p: 2, flex: "1 1 300px", width: { md: "30%", xs: "100%" } }}>
      <Typography variant="h6">로봇 상태 현황</Typography>
      <RobotStatusChart data={data.robotStatus} />
    </Paper>
    <Paper sx={{ p: 2, flex: "3 1 400px", width: { md: "68%", xs: "100%" } }}>
      <Typography variant="h6">작업 성과</Typography>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ padding: "8px", width: "50%" }}>
              <PerformanceKpi
                title="청소 비용 절감"
                value={data.performance.costSaving}
                unit="원"
                subText="(인건비(시급): 12000원)"
              />
            </td>
            <td style={{ padding: "8px", width: "50%" }}>
              <PerformanceKpi
                title="노동 시간 절감"
                value={data.performance.laborTimeSaving}
                unit="h"
                subText="* 주 40시간 근무 기준"
              />
            </td>
          </tr>
          <tr>
            <td style={{ padding: "8px", width: "50%" }}>
              <PerformanceKpi
                title="탄소 배출 절감"
                value={data.performance.co2Reduction}
                unit="t"
                subText="* 차량 운행 중단 환산량"
              />
            </td>
            <td style={{ padding: "8px", width: "50%" }}>
              <PerformanceKpi
                title="절수량"
                value={data.performance.waterSaving}
                unit="K"
                subText="* 약 1,467,000ml 기준"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </Paper>
  </Box>
);

// =======================================================
// 🚀 전체 UserDashboardPage
// =======================================================
export default function UserDashboardPage() {
  const [data] = useState<DashboardData>(initialDashboardData);

  const topKpis = [
    { title: "청소 시간", value: "5.8 h", icon: "🧹" },
    { title: "청소 작업 수", value: "2 회", icon: "📅" },
    { title: "전력 소비", value: "1.65 kwh", icon: "🏭" },
    { title: "물 소비량", value: "5260 ml", icon: "💧" },
  ];

  const chartItems = [
    {
      title: "구역별 청소 횟수 그래프",
      content: <Box sx={{ height: 300, bgcolor: "#eee" }}>AreaCountChart</Box>,
    },
    {
      title: "일별 통계 합계 로봇 가동 시간",
      content: <DailyOperationTimeChart data={data.dailyOperationTime} />,
    },
    {
      title: "",
      content: <Box sx={{ height: 300, opacity: 0 }}></Box>,
      empty: true,
    },
    {
      title: "일별 총 작업 시간(분)",
      content: (
        <Box sx={{ height: 300, bgcolor: "#eee" }}>DailyTaskTimeChart</Box>
      ),
    },
    {
      title: "일별 작업 상태",
      content: (
        <Box sx={{ height: 300, bgcolor: "#eee" }}>DailyTaskStatusChart</Box>
      ),
    },
    {
      title: "일별 작업 완료율(%)",
      content: (
        <Box sx={{ height: 300, bgcolor: "#eee" }}>
          DailyCompletionRateChart
        </Box>
      ),
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        p: 4,
        bgcolor: "#f7f7f7",
        maxWidth: "1400px",
        margin: "0 auto", // 최상위 컨테이너 중앙 정렬
      }}
    >
      <Box sx={{ width: "100%", textAlign: "left" }}>
        <Typography variant="h5" mb={3}>
          창원대 CC1
        </Typography>
      </Box>

      {/* ⭐ KPI 영역: 4개의 개별 Paper 카드로 변경 (Flexbox 사용) */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2, // 아이템 간 간격
          mb: 4,
        }}
      >
        {topKpis.map((kpi, index) => (
          <Paper
            key={index}
            sx={{
              p: 2,
              textAlign: "center",
              flex: "1 1 calc(22% - 15px)",
              minWidth: { xs: "100%", sm: "150px" },

              "@media (max-width: 600px)": {
                flex: "1 1 100%",
              },
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {kpi.icon} {kpi.title}
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              {kpi.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* 로봇 상태 + 작업 성과 (Flexbox 버전 적용) */}
      <RobotAndPerformanceFlex data={data} />

      {/* 로봇 목록 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <RobotListTableMock />
      </Paper>

      {/* 🚀 차트 영역 (Flexbox 레이아웃 적용) */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 4,
        }}
      >
        {chartItems.map((chart, index) => (
          <Paper
            key={index}
            sx={{
              p: 2,
              flex: "1 1 calc(33.33% - 16px)",
              minWidth: { xs: "100%", md: 300 },

              "@media (max-width: 900px)": {
                flex: "1 1 100%",
              },

              display: chart.empty ? { xs: "none", md: "block" } : "block",
              opacity: chart.empty ? 0 : 1,
              height: chart.empty ? { xs: 0, md: 400 } : 400,
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              {chart.title}
            </Typography>
            {chart.content}
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
