import request from "./request";

export interface Quote {
  id?: string;
  content: string;
  translation: string;
  author: string;
  imageUrl?: string;
}

const quoteApi = {
  // 获取随机名言
  getRandomQuote: () => request.get("/quotes/random"),

  // 获取所有名言
  getQuotes: () => request.get("/quotes"),

  // 添加名言
  addQuote: (data: Quote) => request.post("/quotes/addQuote", data),

  // 更新名言
  updateQuote: (id: string, data: Partial<Quote>) =>
    request.put(`/quotes/updateQuote/${id}`, data),

  // 删除名言
  deleteQuote: (id: string) => request.delete(`/quotes/deleteQuote/${id}`),
};

export default quoteApi;
