export const API = {
  AI_CHAT: {
    HISTORY: "/ai/chat/history",
    MESSAGES: (id: string) => `/ai/chat/${id}/messages`,
    SEND: (id: string) => `/ai/chat/${id}`,
  },
  AI_REPORT: {
    LIST: "/ai/report",
    DETAIL: (id: number) => `/ai/report/${id}`,
    RAW: (id: number) => `/ai/report/${id}/rawReport`,
  },
  REPORT: {
    LIST: "/report/list",
    SEARCH: "/report/search",
    REMARK: (id: number) => `/report/${id}/remark`,
  },
  ROBOT: {
    LIST: "/robot/list",
  },
  STORE: {
    LIST: "/store/list",
    INDUSTRY: "/store/industry",
    DETAIL: (id: number) => `/store/${id}`,
    USERS: "/store/user",
  },
  USER: {
    SIGNUP: "/user/signup",
    CHECK_ID: "/user/check_loginid",
    DETAIL: (id: number) => `/user/${id}`,
  },
  SYNC: {
    ALL_STORES: "/report/sync/all-stores",
    STATUS: "/report/sync/status",
    LAST_TIME: "/report/sync/last-time",
  },
  QNA: {
    LIST: "/qna",
    DETAIL: (id: number) => `/qna/${id}`,
  },
  EMBED: {
    FILES: "/embed/files",
    FILE: (id: number) => `/embed/files/${id}`,
    DOWNLOAD: (id: number) => `/embed/files/${id}/download`,
  },
} as const;
