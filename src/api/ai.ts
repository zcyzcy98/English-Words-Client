import request from "./request";

const checkinApi = {
  // 获取签到状态
  chat: (data: { prompt: string; sessionId: string }) => request.post("/ai/chat", data),
};

export default checkinApi;
