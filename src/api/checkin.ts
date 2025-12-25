import request from "./request";

const checkinApi = {
  // 获取签到状态
  getCheckInStatus: () => request.get("/checkin/stats"),

  // 执行签到
  checkIn: () => request.post("/checkin"),
};

export default checkinApi;
