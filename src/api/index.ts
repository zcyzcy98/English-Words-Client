import wordApi from "./word";
import quoteApi from "./quote";
import checkinApi from "./checkin";
import ai from './ai'

// 兼容旧的默认导出方式
const api = {
  ...wordApi,
  ...quoteApi,
  ...checkinApi,
  ...ai
};

export default api;
