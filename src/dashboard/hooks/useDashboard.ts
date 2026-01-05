import { useMemo, useState } from "react";
import type {
  Report,
  Robot,
  UserDashboardData,
  DailyChartData,
  AreaCleanCount,
  DailyTaskStatus,
  DailyCompletionRate,
  RobotStatus,
  Performance,
} from "../../type";

/* 특정 날짜에서 yyyy-mm-dd만 추출 */
function formatDate(dt: string) {
  return dt ? dt.split(" ")[0] : "unknown";
}

/* 로봇 상태 카운트 (작동중/대기/충전/오프라인) */
function getRobotStatusCounts(robots: Robot[]): RobotStatus {
  let working = 0;
  let standby = 0;
  let charging = 0;
  let offline = 0;

  robots.forEach((r) => {
    // 오프라인
    if (!r.online) {
      offline++;
      return;
    }
    // 작업중
    if (r.status === 1) {
      working++;
      return;
    }
    // 충전중
    if (r.isCharging === 1) {
      charging++;
      return;
    }
    // 대기중
    standby++;
  });

  return { working, standby, charging, offline };
}

export default function useDashboard(
  reports: Report[] | null | undefined,
  robots: Robot[] | null | undefined
) {
  const [hourlyWage, setHourlyWage] = useState<number>(13000);

  const data = useMemo<UserDashboardData | null>(() => {
    if (!reports || !robots) return null;

    /* ------------------------------------------------------------
       1) 기본 합산 (총 작업수, 총 청소시간)
       ------------------------------------------------------------ */
    const taskCount = reports.length;

    const totalCleanSeconds = reports.reduce(
      (sum, r) => sum + (r.cleanTime ?? 0),
      0
    );
    const totalCleanHours = totalCleanSeconds / 3600;

    /* ------------------------------------------------------------
       2) 전력량 계산 (% → kWh)
          ⟶ 공식: kWh = (costBattery / 100) * 1.3
       ------------------------------------------------------------ */
    const totalPowerKwh = reports.reduce(
      (sum, r) => sum + ((r.costBattery ?? 0) / 100) * 1.3,
      0
    );

    /* ------------------------------------------------------------
       3) 물 소비량(mL → L)
       ------------------------------------------------------------ */
    const totalWaterMl = reports.reduce(
      (sum, r) => sum + (r.costWater ?? 0),
      0
    );
    const totalWaterL = totalWaterMl / 1000;

    /* ------------------------------------------------------------
       4) 절감량 계산
          기준:
            - 인력 1회 청소 전력 = 10 kWh
            - 인력 1회 청소 물 = 100,000 mL
       ------------------------------------------------------------ */
    const baselinePower = 10 * taskCount; // kWh
    const baselineWaterL = (100000 * taskCount) / 1000; // L

    const savedPowerKwh = baselinePower - totalPowerKwh;
    const savedWaterL = baselineWaterL - totalWaterL;

    /* ------------------------------------------------------------
       5) 탄소 절감량
          전력 1kWh → 0.466 kg CO2
          물 1000L → 0.344 kg CO2
       ------------------------------------------------------------ */
    const co2ReductionKg =
      savedPowerKwh * 0.466 + (savedWaterL / 1000) * 0.344;

    /* ------------------------------------------------------------
       6) 작업 상태 분류 (success / manual / fail)
          - 0 → manual
          - 1,4 → success
          - 2,3,5,6 → fail
       ------------------------------------------------------------ */
    const successCount = reports.filter((r) => r.status === 1 || r.status === 4)
      .length;
    const manualCount = reports.filter((r) => r.status === 0).length;
    const failCount = taskCount - successCount - manualCount;

    /* ------------------------------------------------------------
       7) 일별 운영시간(시)
          날짜: startTime 기준 yyyy-mm-dd
       ------------------------------------------------------------ */
    const dailySeconds = new Map<string, number>();

    reports.forEach((r) => {
      const date = formatDate(r.startTime);
      dailySeconds.set(
        date,
        (dailySeconds.get(date) ?? 0) + (r.cleanTime ?? 0)
      );
    });

    const sortedDaily = Array.from(dailySeconds.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    const dailyOperationTime: DailyChartData = {
      labels: sortedDaily.map(([d]) => d),
      myRobots: sortedDaily.map(([_, sec]) => Number((sec / 3600).toFixed(2))),
      avgTime: sortedDaily.map(() => 0),
    };

    /* ------------------------------------------------------------
       8) 구역별 작업 횟수(mapName 기준)
       ------------------------------------------------------------ */
    const areaMap = new Map<string, number>();
    reports.forEach((r) => {
      const name = r.mapName ?? "미지정";
      areaMap.set(name, (areaMap.get(name) ?? 0) + 1);
    });

    const areaCleanCount: AreaCleanCount = {
      areaNames: Array.from(areaMap.keys()),
      cleanCounts: Array.from(areaMap.values()),
    };

    /* ------------------------------------------------------------
       9) ★★★ 일별 작업상태(success / fail / manual) 그룹핑 ★★★
       ------------------------------------------------------------ */
    const dailyStatusMap = new Map<
      string,
      { success: number; manual: number; fail: number }
    >();

    reports.forEach((r) => {
      const date = formatDate(r.startTime);

      if (!dailyStatusMap.has(date)) {
        dailyStatusMap.set(date, { success: 0, manual: 0, fail: 0 });
      }

      const entry = dailyStatusMap.get(date)!;

      if (r.status === 0) entry.manual++;
      else if (r.status === 1 || r.status === 4) entry.success++;
      else entry.fail++;
    });

    const dailyTaskStatus: DailyTaskStatus = {
      labels: Array.from(dailyStatusMap.keys()).sort(),
      success: [],
      fail: [],
      manual: [],
    };

    dailyTaskStatus.labels.forEach((date) => {
      const e = dailyStatusMap.get(date)!;
      dailyTaskStatus.success.push(e.success);
      dailyTaskStatus.fail.push(e.fail);
      dailyTaskStatus.manual.push(e.manual);
    });

    /* ------------------------------------------------------------
       10) ★★★ 일별 완료율(%) ★★★
       ------------------------------------------------------------ */
    const dailyCompletionRate: DailyCompletionRate = {
      labels: dailyTaskStatus.labels,
      rates: [],
    };

    dailyCompletionRate.labels.forEach((date) => {
      const e = dailyStatusMap.get(date)!;
      const total = e.success + e.manual + e.fail;
      const rate =
        total > 0 ? Math.round((e.success / total) * 1000) / 10 : 0;
      dailyCompletionRate.rates.push(rate);
    });

    /* ------------------------------------------------------------
       11) 인건비 기반 KPI (절감비용/노동시간 활용)
       ------------------------------------------------------------ */
    const costSaving = Math.round(totalCleanHours * hourlyWage);
    const laborTimeSaving = Number(totalCleanHours.toFixed(2));

    const performance: Performance = {
      costSaving,
      laborTimeSaving,
      co2Reduction: Number(co2ReductionKg.toFixed(3)),
      waterSaving: Number(savedWaterL.toFixed(2)),
      taskCount: reports.length,
      powerConsumption: Number(totalPowerKwh.toFixed(2)),
      waterConsumption: Number(totalWaterL.toFixed(2)),
    };

    /* ------------------------------------------------------------
       12) 로봇 상태 집계
       ------------------------------------------------------------ */
    const robotStatus = getRobotStatusCounts(robots);

    /* ------------------------------------------------------------
       최종 결과 생성
       ------------------------------------------------------------ */
    const result: UserDashboardData = {
      robotStatus,
      performance,
      dailyOperationTime,
      areaCleanCount,
      dailyTaskTime: dailyOperationTime,
      dailyTaskStatus,
      dailyCompletionRate,
    };

    return result;
  }, [reports, robots, hourlyWage]);

  return { data, hourlyWage, setHourlyWage };
}