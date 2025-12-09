export type Store = {
    storeId: number;
    shopId: number;
    shopName: string;
    industryId: number;
}

export type Industry = {
    industryId: number;
    industryName: string;
}

export type User = {
    userId: number;
    id: string;
    pw: string;
    name: string;
    phone: string;
    email: string;
    role: "MANAGER" | "USER"; // 권한부여에서 "ADMIN"사용안함 + 권한은 토큰을 통해서 확인 하므로 "ADMIN"제외
    storeId: number;
}

// ApiFormUser는 User 타입에서 userId만 제외한 형태
export type ApiFormUser= Omit<User, "userId">;

export type LoginRequest = {
    id: string;
    pw: string;
};

export type LoginResponse = {
    jwtToken: string;
    roleLevel: number;
    storeId: number;
    userId: number;
};

export type Robot = {
    robotId: number;
    sn: string;
    mac: string;
    productCode: string;
    softVersion: string;
    work_status: string;
    nickname: string;
    battery: number;
    online_yn: 0 | 1;
    storeId: number;
}

export type Report = {
    reportId: number;
    status: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    startTime: string;
    endTime: string;
    cleanTime: number;
    taskArea: number;
    cleanArea: number;
    mode: 1 | 2;
    costBattery: number;
    costWater: number;
    mapName: string;
    mapUrl: string;
    storeId: number;
    robotId: number;
    sn:number;
}

export type AiChat = {
    aiChatId: number;
    conversationId: number;
    senderType: "USER" | "AI";
    rawMessage: string;
    createdAt: string;
    messageIndex: number;
    userId: number;
}

export type AiReport = {
    aiReportId: number;
    conversationId: number;
    startTime: string;
    endTime: string;
    createdAt: string;
    rawMessage: string;
    rawReport: string;
    userId: number;
    name: string;
}

import { Dayjs } from "dayjs";

// 컴포넌트에 전달될 props 타입 정의
export interface DateRangePickerProps {
  value: [Dayjs | null, Dayjs | null]; // 선택된 시작일과 종료일
  onChange: (range: [Dayjs | null, Dayjs | null]) => void; // 날짜 범위 변경 시 호출되는 함수
  label?: string; // 기본 표시 라벨 (날짜 선택 전 표시)
  fullWidth?: boolean; // 추가 옵션: 전체 너비 사용 여부
  size?: "small" | "medium"; // 추가 옵션: 크기 설정
};

export interface PaginationProps {
 page: number; // 현재 페이지 번호
  totalPages: number; // 전체 페이지 수
  onPageChange: (page: number) => void; // 페이지 변경 시 호출되는 함수
  maxButtons?: number; // 한 화면에 보여줄 최대 버튼 수 (기본값 5)
};

export type SenderType = 'USER' | 'AI';

export interface AiChatDTO {
  aiChatId: number;
  conversationId: string;
  senderType: SenderType;
  rawMessage: string;
  createdAt: string; // LocalDateTime
  messageIndex: number;
  userId: number;
  userName: string;
}

export interface ChatPromptRequest {
  message: string;
  conversationId: string | null; // 새 대화 시작 시 null
}

export interface ChatMessage {
    id: string; // 프론트엔드에서 사용할 고유 ID (aiChatId 또는 임시 ID)
    conversationId: string;
    senderType: SenderType;
    content: string;
    timestamp: string;
    isPending: boolean; // SSE 스트리밍 중인지 여부  
}



