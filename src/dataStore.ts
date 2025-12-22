import { create } from "zustand";
import { getStores } from "./operationManagement/api/StoreApi";

import { getRobots } from "./robot/api/RobotApi";
import { getIndustry } from "./operationManagement/api/StoreApi";
import type { Store, Report, Robot, Industry } from "./type";
import { getReports } from "./report/api/ReportApi";

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
  fetchReports: (params: {
  storeId?: number;
  filterStoreId?: number;
  sn?: string;
  startDate: string;
  endDate: string;
  page?: number;
  size?: number;
}) => Promise<void>;
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

  fetchStores: async () => {
  try {
    set({ loading: true, error: null });
    const page = 1;  
    const size = 20;   
    const data = await getStores(page, size);
    set({ stores: data.content });
  } finally {
    set({ loading: false });
  }
},

  fetchReports: async (params) => {
  try {
    set({ loading: true, error: null });

    const data = await getReports(params);

    // 페이징 / 비페이징 둘 다 대응
    const reports = Array.isArray(data)
      ? data
      : data.content;

    set({
      reports,
      lastRange: {
        start: params.startDate,
        end: params.endDate,
      },
      lastStoreId: params.storeId,
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
