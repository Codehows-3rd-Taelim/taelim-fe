export type Store = {
    storeId: number;
    shopId: number;
    shopName: string;
    delYn?: string;
    industryId?: number;
    industry?: {
        industryId: number;
        industryName: string;
    };
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

/* ======= 인증 / 로그인 ======= */
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

/* ======= 로봇 ======= */
export type Robot = {
    robotId: number;
    sn: string;
    mac: string;
    productCode: string;
    softVersion: string;
    status: number;
    nickname: string;
    battery: number;
    online: true | false;
    storeId: number;
    isCharging: number;
}

/* ======= 리포트 ======= */
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

/* ======= ai chat ======= */
export type AiChat = {
  aiChatId: number;
  conversationId: string;
  senderType: "USER" | "AI";
  rawMessage: string;
  createdAt: string;
  messageIndex: number;
  userId: number;
}

export type SenderType = 'USER' | 'AI';

/* ======= ai report ======= */
export type AiReport = {
  aiReportId: number;
  conversationId: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  rawMessage: string;
  rawReport: string;
  userId: number;
  name: string;
}
  
export type RawReport = {
    rawReport: string;
}

/* ======= chat ui 전용 ======= */
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
    id: string; 
    conversationId: string;
    senderType: SenderType;
    content: string;
    timestamp: string;
    isPending: boolean; // 
}

// SSE나 유저가 즉석에서 생성한 임시 메시지 
export interface Message {
  id: string;
  rawMessage: string;
  senderType: SenderType;
}

/*  ======= 날짜 ======= */
import { Dayjs } from "dayjs";

// 컴포넌트에 전달될 props 타입 정의
export interface DateRangePickerProps {
  value: [Dayjs | null, Dayjs | null]; // 선택된 시작일과 종료일
  onChange: (range: [Dayjs | null, Dayjs | null]) => void; // 날짜 범위 변경 시 호출되는 함수
  label?: string; // 기본 표시 라벨 (날짜 선택 전 표시)
  fullWidth?: boolean; // 추가 옵션: 전체 너비 사용 여부
  size?: "small" | "medium"; // 추가 옵션: 크기 설정
};

/* ======= 페이징 ======= */
export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  maxButtons?: number;
}

/* 동기화 정보 DTO */
export interface SyncRecordDTO {
  lastSyncTime: string | null;
  globalSyncTime: string | null;
}

/* 대시보드 타입 */
// 로봇 상태 데이터 타입 (도넛/파이 차트용)
export interface RobotStatus {
    working: number;
    standby: number;
    charging: number;
    offline: number;
}

// 작업 성과 KPI 데이터 타입
export interface Performance {
    laborTimeSaving: number;
    taskCount: number;
    costSaving: number;
    waterSaving: number;
    co2Reduction: number;
    powerConsumption?: number; // 실제 전력 소비 (kWh)
    waterConsumption?: number; // 실제 물 소비 (L)
}

// 일별 차트 데이터 기본 구조 (라인/막대 차트용)
export interface DailyChartData {
    labels: string[]; // 날짜 레이블
    myRobots: number[]; // 특정 값 1
    avgTime: number[]; // 특정 값 2
}

// 구역별 청소 횟수 (막대 차트)
export interface AreaCleanCount {
    areaNames: string[];
    cleanCounts: number[];
}

// 일별 작업 상태 (누적 막대 차트)
export interface DailyTaskStatus {
    labels: string[];
    success: number[];
    fail: number[];
    manual: number[];
}

// 일별 완료율 (라인 차트)
export interface DailyCompletionRate {
    labels: string[];
    rates: number[];
}

// ---------------------------------------------------------
// 일반 사용자/매장 담당자용 대시보드 데이터 타입
export interface UserDashboardData {
    robotStatus: RobotStatus;
    performance: Performance;
    dailyOperationTime: DailyChartData;
    areaCleanCount: AreaCleanCount;
    dailyTaskTime: DailyChartData;
    dailyTaskStatus: DailyTaskStatus;
    dailyCompletionRate: DailyCompletionRate;
}

// ---------------------------------------------------------
// 관리자용 매장 요약 데이터 (테이블 행)
export type StoreSummary = {
    storeId: number;
    shopName: string;
    robotCount: number;
    workingRobots: number;
    cleanTimeTotal: number; // 분
    areaCleanedTotal: number; // m²
};

// 관리자용 대시보드 데이터 타입
export interface AdminDashboardData {
  totalRobots: number;
  totalWorking: number;
  totalOffline: number;

  storeSummaries: StoreSummary[];

  industryOperationTime: DailyChartData;
  storeCleanTime: { labels: string[]; times: number[] };
  storeCleanArea: { labels: string[]; areas: number[] };

  robotTopTime: RobotTopTime[];
  storeStatusCount: StoreStatusCount[];
  industryCompare: IndustryCompare[];
  industryStoreCount: IndustryStoreCount[];
}

export interface RobotTopTime {
  robotId: number;
  robotName: string;
  workTime: number; // 총 가동시간 (분 or 시간)
}

export interface StoreStatusCount {
  status: "ACTIVE" | "INACTIVE" | "ERROR";
  count: number;
  [key: string]: string | number;
}

export interface IndustryCompare {
  industryId: number;
  industryName: string;
  totalTime: number; // 전체 가동 시간
  totalArea: number; // 전체 청소 면적
}

export type IndustryStoreCount = {
  industryId: number;
  industryName: string;
  storeCount: number;
};

export type PaginationResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  
};


export type Question = {
  questionId: number;
  userQuestionText: string;
  normalizedText: string;
  resolved: boolean;
  createdAt: string;     
}

export type Answer = {
  questionId: number;
  answerText: string;
}


