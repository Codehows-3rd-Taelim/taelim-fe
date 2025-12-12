import { create } from "zustand";
import { getStores } from "./operationManagement/api/StoreApi";
import { getReport } from "./report/api/ReportApi";
import { getRobots } from "./robot/api/RobotApi";
import { getIndustry } from "./operationManagement/api/StoreApi";
import type { Store, Report, Robot, Industry } from "./type";

interface State {
  stores: Store[];
  reports: Report[];
  robots: Robot[];
  industries: Industry[];

  loading: boolean;
  error: string | null;

  lastRange?: { start: string; end: string };
  lastStoreId?: number;

  fetchStores: (storeId?: number) => Promise<void>;
  fetchReports: (storeId: number | undefined, start: string, end: string) => Promise<void>;
  fetchRobots: (storeId?: number) => Promise<void>;
  fetchIndustries: () => Promise<void>;
}

export const useDataStore = create<State>((set) => ({
  stores: [],
  reports: [],
  robots: [],
  industries: [],

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

  fetchIndustries: async () => {
    try {
      set({ loading: true, error: null });
      const data = await getIndustry();
      set({ industries: data });
    } finally {
      set({ loading: false });
    }
  },
}));
