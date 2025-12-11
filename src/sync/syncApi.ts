// src/api/syncApi.ts
export async function syncNow(): Promise<string> {
  const token = localStorage.getItem("jwtToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const res = await fetch("/api/sync/now", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}), // Body 없어도 됨 (백에서 기본값 적용)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "동기화 실패");
  }

  return res.text(); // 백엔드에서 String 반환
}

export const getLastSyncTime = async (): Promise<SyncRecordDTO> => {
  const token = localStorage.getItem("jwtToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const res = await fetch("/api/sync/last", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch last sync time");

  return res.json(); // { lastSyncTime, globalSyncTime }
};


// 동기화 정보 DTO
export interface SyncRecordDTO {
  lastSyncTime: string | null;
  globalSyncTime: string | null;
}
