import { create } from "zustand";
import { getStores } from "./operationManagement/api/StoreApi";
import { getReport } from "./report/api/ReportApi";
import { getRobots } from "./robot/api/RobotApi";
import type { Store, Report, Robot } from "./type";

interface State {
  stores: Store[];
  reports: Report[];
  robots: Robot[];

  loading: boolean;
  error: string | null;

  // 최근 조회 조건 저장하면 Dashboard/ReportPage 둘 다 사용 가능
  lastRange?: { start: string; end: string };
  lastStoreId?: number;

  // Actions
  fetchStores: (storeId?: number) => Promise<void>;
  fetchReports: (storeId: number | undefined, start: string, end: string) => Promise<void>;
  fetchRobots: (storeId?: number) => Promise<void>;
}

export const useDataStore = create<State>((set) => ({
  stores: [],
  reports: [],
  robots: [],

  loading: false,
  error: null,

  fetchStores: async (storeId) => {
    try {
      set({ loading: true, error: null });
      const data = await getStores(storeId);
      set({ stores: data });
    } finally {
      set({ loading: false });
    }
  },

  fetchReports: async (storeId, start, end) => {
    try {
      set({ loading: true, error: null });
      const data = await getReport(storeId, start, end);

      set({
        reports: data,
        lastRange: { start, end },
        lastStoreId: storeId,
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchRobots: async (storeId) => {
    try {
      set({ loading: true, error: null });
      const data = await getRobots(storeId);
      set({ robots: data });
    } finally {
      set({ loading: false });
    }
  },
}));