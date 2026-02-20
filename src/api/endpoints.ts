// API 엔드포인트 중앙 관리
const API_BASE = '/api';

export const endpoints = {
    auth: {
        login: `${API_BASE}/auth/login`,
    },
    users: {
        base: `${API_BASE}/users`,
        checkLogin: `${API_BASE}/users/check-login`,
        byId: (id: number) => `${API_BASE}/users/${id}`,
    },
    stores: {
        base: `${API_BASE}/stores`,
        users: `${API_BASE}/stores/users`,
        byId: (id: number) => `${API_BASE}/stores/${id}`,
    },
    industries: `${API_BASE}/industries`,
    robots: `${API_BASE}/robots`,
    reports: {
        base: `${API_BASE}/reports`,
        search: `${API_BASE}/reports/search`,
        remark: (id: number) => `${API_BASE}/reports/${id}/remark`,
        sync: `${API_BASE}/reports/sync/all-stores/historical`,
        syncStatus: `${API_BASE}/reports/sync/status`,
    },
    ai: {
        chats: `${API_BASE}/ai/chats`,
        chatMessages: `${API_BASE}/ai/chats/messages`,
        conversationMessages: (id: string) => `${API_BASE}/ai/chats/${id}/messages`,
        reports: `${API_BASE}/ai/reports`,
        reportRaw: (id: number) => `${API_BASE}/ai/reports/${id}/raw`,
        reportById: (id: number) => `${API_BASE}/ai/reports/${id}`,
    },
    qna: {
        base: `${API_BASE}/qna`,
        byId: (id: number) => `${API_BASE}/qna/${id}`,
        answer: (id: number) => `${API_BASE}/qna/${id}/answer`,
        restore: (id: number) => `${API_BASE}/qna/${id}/restore`,
        embedding: (id: number) => `${API_BASE}/qna/${id}/embedding`,
        question: (id: number) => `${API_BASE}/qna/${id}/question`,
    },
    embeddings: {
        files: `${API_BASE}/embeddings/files`,
        fileById: (id: number) => `${API_BASE}/embeddings/files/${id}`,
        download: (id: number) => `${API_BASE}/embeddings/files/${id}/download`,
    },
    sync: {
        trigger: `${API_BASE}/sync`,
        last: `${API_BASE}/sync/last`,
    },
};
