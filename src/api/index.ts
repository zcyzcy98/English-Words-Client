import wordApi from "./word";
import quoteApi from "./quote";
import checkinApi from "./checkin";

// 兼容旧的默认导出方式
const api = {
  ...wordApi,
  ...quoteApi,
  ...checkinApi,
};

export default api;
