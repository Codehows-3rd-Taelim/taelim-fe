import { useMemo } from "react";
import type {
  Store,
  Robot,
  Report,
  AdminDashboardData,
  StoreSummary,
  DailyChartData,
  RobotTopTime,
  StoreStatusCount,
  Industry,
  IndustryCompare,
  IndustryStoreCount,
} from "../../type";

// industryId 추출 헬퍼 함수
function getIndustryId(store: Store): number | null {
  // 1순위: industry 객체에서 추출
  if (store.industry?.industryId !== undefined) {
    return store.industry.industryId;
  }
  // 2순위: 직접 industryId 필드
  if (store.industryId !== undefined) {
    return store.industryId;
  }
  return null;
}

// industryName 추출 헬퍼 함수
function getIndustryName(store: Store, industries: Industry[]): string {
  const industryId = getIndustryId(store);
  
  if (industryId === null) return "미분류";
  
  // 1순위: store.industry.industryName
  if (store.industry?.industryName) {
    return store.industry.industryName;
  }
  
  // 2순위: industries 배열에서 검색
  const industry = industries.find((i) => i.industryId === industryId);
  return industry?.industryName ?? `산업 ${industryId}`;
}

export default function useDashboardAdmin(
  stores: Store[],
  robots: Robot[],
  reports: Report[],
  industries: Industry[]
): AdminDashboardData {
  // 1) KPI
  const totalRobots = robots.length;
  const totalWorking = robots.filter((r) => r.status === 1).length;
  const totalOffline = robots.filter((r) => r.online === false).length;

  // 2) 매장 요약
  const storeSummaries: StoreSummary[] = useMemo(() => {
    return stores.map((store) => {
      const storeRobots = robots.filter((r) => r.storeId === store.storeId);
      const storeReports = reports.filter((rp) => rp.storeId === store.storeId);

      const cleanTimeTotal = storeReports.reduce((s, r) => s + r.cleanTime, 0);
      const areaCleanedTotal = storeReports.reduce((s, r) => s + r.cleanArea, 0);
      const workingRobots = storeRobots.filter((r) => r.status === 1).length;

      return {
        storeId: store.storeId,
        shopName: store.shopName,
        robotCount: storeRobots.length,
        workingRobots,
        cleanTimeTotal,
        areaCleanedTotal,
      };
    });
  }, [stores, robots, reports]);

  // 3) 로봇 TOP 시간
  const robotTopTime: RobotTopTime[] = useMemo(() => {
    const map = new Map<number, number>();

    reports.forEach((r) => {
      map.set(r.robotId, (map.get(r.robotId) ?? 0) + r.cleanTime);
    });

    return robots
      .map((robot) => ({
        robotId: robot.robotId,
        robotName: robot.nickname,
        workTime: map.get(robot.robotId) ?? 0,
      }))
      .sort((a, b) => b.workTime - a.workTime)
      .slice(0, 5);
  }, [robots, reports]);

  // 4) 매장 상태 요약
  const storeStatusCount: StoreStatusCount[] = useMemo(() => {
    const result: StoreStatusCount[] = [
      { status: "ACTIVE", count: 0 },
      { status: "INACTIVE", count: 0 },
      { status: "ERROR", count: 0 },
    ];

    stores.forEach((store) => {
      const storeRobots = robots.filter((r) => r.storeId === store.storeId);

      if (storeRobots.some((r) => r.status === 3)) result[2].count++; // ERROR
      else if (storeRobots.some((r) => r.status === 1)) result[0].count++; // ACTIVE
      else result[1].count++; // INACTIVE
    });

    return result;
  }, [stores, robots]);

  // 5) 산업별 시간/면적 비교
  const industryCompare: IndustryCompare[] = useMemo(() => {
    const map = new Map<number, { name: string; time: number; area: number }>();

    stores.forEach((store) => {
      const industryId = getIndustryId(store);
      if (industryId === null) return;

      const industryName = getIndustryName(store, industries);

      const storeReports = reports.filter((r) => r.storeId === store.storeId);

      const totalTime = storeReports.reduce((s, r) => s + r.cleanTime, 0);
      const totalArea = storeReports.reduce((s, r) => s + r.cleanArea, 0);

      const prev = map.get(industryId);
      if (prev) {
        prev.time += totalTime;
        prev.area += totalArea;
      } else {
        map.set(industryId, {
          name: industryName,
          time: totalTime,
          area: totalArea,
        });
      }
    });

    return Array.from(map.entries()).map(([industryId, v]) => ({
      industryId,
      industryName: v.name,
      totalTime: v.time,
      totalArea: v.area,
    }));
  }, [stores, reports, industries]);

  // 5-2) 업종별 매장 수
  const industryStoreCount: IndustryStoreCount[] = useMemo(() => {
    if (!stores || stores.length === 0) return [];

    console.log('stores:', stores); // 디버깅용
    console.log('industries:', industries); // 디버깅용

    // 1) 매장 수 집계
    const countMap = new Map<number, { name: string; count: number }>();
    
    stores.forEach((store) => {
      const industryId = getIndustryId(store);
      console.log('store:', store.shopName, 'industryId:', industryId); // 디버깅용
      
      if (industryId === null) return;

      const industryName = getIndustryName(store, industries);

      const prev = countMap.get(industryId);
      if (prev) {
        prev.count++;
      } else {
        countMap.set(industryId, { name: industryName, count: 1 });
      }
    });

    console.log('countMap:', Array.from(countMap.entries())); // 디버깅용

    // 2) 결과 배열 생성
    const result = Array.from(countMap.entries()).map(([industryId, data]) => ({
      industryId,
      industryName: data.name,
      storeCount: data.count,
    }));

    console.log('industryStoreCount result:', result); // 디버깅용

    return result;
  }, [stores, industries]);

  // 6) 산업별 일별 가동 시간
  const industryOperationTime: DailyChartData = useMemo(() => {
    if (reports.length === 0) {
      return { labels: [], myRobots: [], avgTime: [] };
    }

    const map = new Map<string, number>();

    reports.forEach((r) => {
      const date = r.startTime.split(" ")[0];
      map.set(date, (map.get(date) ?? 0) + r.cleanTime);
    });

    const labels = Array.from(map.keys()).sort();
    const values = labels.map(date => map.get(date) ?? 0);

    return {
      labels,
      myRobots: values,
      avgTime: values.map(() => 0),
    };
  }, [reports]);

  // 7) 매장별 총 청소 시간
  const storeCleanTime = useMemo(() => {
    const labels: string[] = [];
    const times: number[] = [];

    stores.forEach((store) => {
      const totalTime = reports
        .filter((r) => r.storeId === store.storeId)
        .reduce((s, r) => s + r.cleanTime, 0);

      labels.push(store.shopName);
      times.push(totalTime);
    });

    return { labels, times };
  }, [stores, reports]);

  // 8) 매장별 총 청소 면적
  const storeCleanArea = useMemo(() => {
    const labels: string[] = [];
    const areas: number[] = [];

    stores.forEach((store) => {
      const totalArea = reports
        .filter((r) => r.storeId === store.storeId)
        .reduce((s, r) => s + r.cleanArea, 0);

      labels.push(store.shopName);
      areas.push(totalArea);
    });

    return { labels, areas };
  }, [stores, reports]);

  return {
    totalRobots,
    totalWorking,
    totalOffline,
    storeSummaries,
    industryOperationTime,
    storeCleanTime,
    storeCleanArea,
    robotTopTime,
    storeStatusCount,
    industryCompare,
    industryStoreCount,
  };
}