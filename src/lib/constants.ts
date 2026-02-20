export const BASE_URL = import.meta.env.VITE_API_URL as string;

export const ROLE_LEVEL = {
  USER: 1,
  MANAGER: 2,
  ADMIN: 3,
} as const;

export const BATTERY_TO_KWH_FACTOR = 1.3;

/** costBattery → kWh 변환 (ReportPage, CleanReport 공식) */
export function batteryToKwh(costBattery: number): number {
  return Math.round(costBattery * BATTERY_TO_KWH_FACTOR * 100) / 10000;
}

export const DEFAULT_HOURLY_WAGE = 13000;

export const CO2_PER_KWH = 0.466;
export const CO2_PER_1000L = 0.344;

/** 매장/유저 전체 조회 시 사용하는 최대 페이지 크기 */
export const MAX_STORE_FETCH = 500;

/** 하루 총 분 수 (24h * 60min) */
export const DAY_MINUTES = 1440;

/** 기본 페이지 크기 */
export const DEFAULT_PAGE_SIZE = 20;
