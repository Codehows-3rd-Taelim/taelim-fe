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
    userId?: number;
    id: string;
    pw: string;
    name: string;
    phone: string;
    email: string;
    role: "ADMIN" | "MANAGER" | "USER";
    storeId: number;
}

export type LoginRequest = {
    id: string;
    pw: string;
};

export type LoginResponse = {
    jwtToken: string;
    roleLevel: number;
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
    start_time: string;
    end_time: string;
    clean_time: number;
    task_area: number;
    clean_area: number;
    mode: 1 | 2;
    costBattery: number;
    costWater: number;
    mapName: string;
    mapUrl: string;
    robotId: number;
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
}