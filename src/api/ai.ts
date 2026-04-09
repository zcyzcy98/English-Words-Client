import request from "./request";

const aiApi = {
  // 聊天
  chat: (data: { prompt: string; sessionId: string }) => request.post("/ai/chat", data),
  // 生成名言
  generateQuote: () => request.get("/ai/generate/quote"),
};

export default aiApi 
;
