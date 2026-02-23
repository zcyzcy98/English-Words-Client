import request from "./request";

export interface WordData {
  word: string;
  phonetic?: string;
  partOfSpeech?: string[];
  meaning: string;
  example?: string;
  category?: string[];
}

const wordApi = {
  // 获取统计信息
  getStats: () => request.get("/words/stats"),

  // 获取单词复习统计信息（热力图数据）
  getReviewStats: (year: number) => request.get(`/words/review-stats/${year}`),

  // 获取所有单词
  getWords: () => request.get("/words"),

  // 添加单词
  addWord: (data: WordData) => request.post("/words/addWord", data),

  // 更新单词
  updateWord: (id: string, data: Partial<WordData>) =>
    request.put(`/words/updateWord/${id}`, data),

  // 删除单词
  deleteWord: (id: string) => request.delete(`/words/deleteWord/${id}`),

  // 批量删除单词
  batchDeleteWord: (ids: string[]) =>
    request.delete(`/words/batchDeleteWord`, { data: { ids } }),

  // 获取今日复习单词
  getReviewWords: () => request.get("/words/review"),

  // 提交复习结果
  submitReview: (id: string, remembered: boolean) =>
    request.post(`/words/review/${id}`, { remembered }),
};

export default wordApi;
