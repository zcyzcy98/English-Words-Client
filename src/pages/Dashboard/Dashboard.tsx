import { useEffect, useState } from "react";
import { Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import ReactECharts from "echarts-for-react";
import { CheckOutlined, FireOutlined } from "@ant-design/icons";
import api from "@/api";
import "./Dashboard.css";

type Quote = {
  _id: string;
  content: string;
  translation: string;
  author: string;
  imageUrl?: string;
};

type Badge = {
  id: string;
  days: number;
  icon: string;
  name: string;
};
type CheckInData = {
  consecutiveDays: number;
  todayCheckIn: boolean;
  badges: Badge[];
};

// 签到里程碑配置
const MILESTONES = [
  { days: 1, name: "新手打卡", icon: "🏅" },
  { days: 7, name: "坚持一周", icon: "🎖️" },
  { days: 14, name: "双周达人", icon: "⭐" },
  { days: 30, name: "月度之星", icon: "🌟" },
  { days: 60, name: "学习达人", icon: "💪" },
  { days: 90, name: "季度冠军", icon: "🏆" },
  { days: 180, name: "半年坚持", icon: "👑" },
  { days: 365, name: "年度王者", icon: "🎯" },
];

function Dashboard() {
  const navigate = useNavigate();
  const [todayReview, setTodayReview] = useState(0);
  const [todayReviewed, setTodayReviewed] = useState(0);
  const [heatmapData, setHeatmapData] = useState<[string, number][]>([]);

  const [randomQuote, setRandomQuote] = useState<Quote>({} as Quote);

  // 签到相关状态
  const [checkInData, setCheckInData] = useState<CheckInData>({
    consecutiveDays: 0,
    todayCheckIn: false,
    badges: [],
  });
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    fetchData();
    getRandomQuote();
    fetchCheckInStatus();
  }, []);

  // 获取签到状态
  const fetchCheckInStatus = async () => {
    try {
      const res = await api.getCheckInStatus();
      if (res.status === 200) {
        // console.log(res)
        setCheckInData(res.data);
      }
    } catch {
      // 接口不存在时使用默认值
    }
  };

  // 执行签到
  const handleCheckIn = async () => {
    if (checkingIn || checkInData.todayCheckIn) return;
    setCheckingIn(true);
    try {
      const res = await api.checkIn();
      if (res.status === 200) {
        console.log(res);
        const data = res.data.data || res.data;

        setCheckInData({
          consecutiveDays: data.consecutiveDays,
          todayCheckIn: true,
          badges: data.badges || checkInData.badges,
        });
        if (data.newBadge) {
          message.success(`恭喜获得新徽章：${data.newBadge}`);
        } else {
          message.success("签到成功！");
        }
      }
    } catch {
      message.error("签到失败，请稍后重试");
    } finally {
      setCheckingIn(false);
    }
  };

  // 获取随机名句
  const getRandomQuote = async () => {
    const res = await api.getRandomQuote();
    if (res.status === 200) {
      setRandomQuote(res.data.data);
    }
  };

  const fetchData = async () => {
    // 获取统计数据
    const statsRes = await api.getStats();
    setTodayReview(statsRes.data.todayReview);
    setTodayReviewed(statsRes.data.todayReviewed);

    // 获取热力图数据
    const heatmapRes = await api.getReviewStats(new Date().getFullYear());
    const reviewStats = heatmapRes.data;
    const data: [string, number][] = [];
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      const count = reviewStats.data[dateStr] || 0;
      data.push([dateStr, count]);
    }
    setHeatmapData(data);
  };

  const pieOption = {
    tooltip: {
      trigger: "item", // 触发类型：数据项图形触发
      backgroundColor: "rgba(255, 255, 255, 0.9)", // 浮层背景色
      borderRadius: 8,
      textStyle: {
        color: "#333",
      },
      // 格式化显示内容
      formatter: "{b}: {c}个 ({d}%)", // {b}是name, {c}是value, {d}是百分比
    },
    series: [
      {
        type: "pie",
        radius: ["60%", "80%"],
        avoidLabelOverlap: false,
        label: { show: false },
        data: [
          {
            value: todayReview,
            name: "未复习",
            itemStyle: {
              color: {
                type: "linear",
                x: 0.5, // 圆心横坐标
                y: 0.5, // 圆心纵坐标
                r: 0.5, // 半径
                colorStops: [
                  { offset: 0, color: "#c4b5fd" }, // 开头：亮紫色
                  { offset: 1, color: "#7c3aed" }, // 结尾：深紫色
                ],
              },
            },
          },
          {
            value: todayReviewed,
            name: "已复习",
            itemStyle: {
              color: {
                type: "radial",
                x: 0.5, // 圆心横坐标
                y: 0.5, // 圆心纵坐标
                r: 0.5, // 半径
                colorStops: [
                  { offset: 0, color: "#ddd6fe" }, // 圆心处（开头）：浅紫
                  { offset: 1, color: "#7c3aed" }, // 边缘处（结尾）：深紫
                ],
              },
            },
          },
        ],
      },
    ],
    graphic: {
      type: "text",
      left: "center",
      top: "center",
      style: {
        text: `${Math.round(
          (todayReviewed / (todayReviewed + todayReview)) * 100 || 0
        )}%`,
        textAlign: "center",
        fill: "#fff",
        fontSize: 28,
        fontWeight: "bold",
      },
    },
  };

  // 热力图配置
  const heatmapOption = {
    tooltip: {
      position: "top",
      formatter: (params: { value: [string, number] }) => {
        return `${params.value[0]}<br/>学习: ${params.value[1]} 个单词`;
      },
    },
    visualMap: {
      show: false,
      min: 0,
      max: 10,
      calculable: false,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      inRange: {
        color: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
      },
    },
    calendar: {
      top: 50,
      left: 40,
      right: 40,
      cellSize: 14,
      range: [
        new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          .toISOString()
          .split("T")[0],
        new Date().toISOString().split("T")[0],
      ],
      itemStyle: {
        borderWidth: 3,
        borderColor: "#fff",
      },
      yearLabel: { show: false },
      monthLabel: {
        nameMap: [
          "1月",
          "2月",
          "3月",
          "4月",
          "5月",
          "6月",
          "7月",
          "8月",
          "9月",
          "10月",
          "11月",
          "12月",
        ],
        color: "#666",
        fontSize: 12,
      },
      dayLabel: {
        firstDay: 1,
        nameMap: ["日", "一", "二", "三", "四", "五", "六"],
        color: "#666",
        fontSize: 10,
      },
      splitLine: { show: false },
    },
    series: [
      {
        type: "heatmap",
        coordinateSystem: "calendar",
        data: heatmapData,
        itemStyle: {
          borderRadius: 2,
        },
      },
    ],
  };

  return (
    <div className="h-full w-full bg-gray-50 overflow-auto">
      <div className="p-6 space-y-6 h-full">
        {/* 上方卡片区域 */}
        <div className="flex gap-6 h-[50%]">
          <Card hoverable className="Card flex-1">
            <div className="h-full flex text-white">
              {/* 左侧：复习目标 */}
              <div className="flex-1 flex flex-col items-center">
                <div className="text-lg font-bold mb-1">今日复习目标</div>
                <ReactECharts
                  option={pieOption}
                  style={{ height: "100%", width: "100%" }}
                />
                <Button
                  type="primary"
                  variant="solid"
                  size="large"
                  shape="round"
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow"
                  style={{
                    background: "linear-gradient(to right, #8b5cf6, #d946ef)",
                    color: "#fff",
                    fontWeight: 600,
                    padding: "0 24px",
                    height: 40,
                    border: "none",
                  }}
                  onClick={() => navigate("/reviewWord")}
                >
                  开始复习单词
                </Button>
              </div>

              {/* 分隔线 */}
              <div className="w-px bg-white/20 mx-4" />

              {/* 右侧：签到 */}
              <div className="flex-1 flex flex-col items-center justify-center">
                {/* 连续签到天数 */}
                <div className="flex items-center gap-2 mb-2">
                  <FireOutlined className="text-2xl text-orange-400" />
                  <span className="text-4xl font-bold">
                    {checkInData.consecutiveDays}
                  </span>
                  <span className="text-white/60 text-sm">天</span>
                </div>
                <div className="text-white/60 text-sm mb-4">连续签到</div>

                {/* 里程碑进度 */}
                <div className="flex items-center gap-1 mb-4">
                  {MILESTONES.map((milestone, index) => {
                    const achieved =
                      checkInData.consecutiveDays >= milestone.days;
                    return (
                      <div key={milestone.days} className="flex items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                            achieved
                              ? "bg-orange-400 text-white"
                              : "bg-white/20 text-white/50"
                          }`}
                          title={`${milestone.days}天: ${milestone.name}`}
                        >
                          {achieved ? milestone.icon : milestone.days}
                        </div>
                        {index < MILESTONES.length - 1 && (
                          <div
                            className={`w-3 h-0.5 ${
                              checkInData.consecutiveDays >=
                              MILESTONES[index + 1]?.days
                                ? "bg-orange-400"
                                : "bg-white/20"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 签到按钮 */}
                <Button
                  type="primary"
                  size="large"
                  shape="round"
                  loading={checkingIn}
                  disabled={checkInData.todayCheckIn}
                  onClick={handleCheckIn}
                  className="h-10 px-6 font-semibold"
                  style={{
                    background: checkInData.todayCheckIn
                      ? "rgba(255,255,255,0.2)"
                      : "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
                    border: "none",
                    color: "#fff",
                    boxShadow: checkInData.todayCheckIn
                      ? "none"
                      : "0 4px 12px rgba(249, 115, 22, 0.4)",
                  }}
                >
                  {checkInData.todayCheckIn ? (
                    <>
                      <CheckOutlined className="mr-1" />
                      已签到
                    </>
                  ) : (
                    "立即签到"
                  )}
                </Button>

                {/* 已获得徽章展示 */}
                {checkInData.badges.length > 0 && (
                  <div className="mt-4 w-full">
                    <div className="text-white/60 text-xs mb-2 text-center">
                      已获得徽章
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {checkInData.badges.map((badge: Badge) => {
                        return (
                          <div
                            key={badge.id}
                            className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full text-xs"
                            title={`${badge.days}天达成`}
                          >
                            <span>{badge?.icon}</span>
                            <span className="text-white/80">{badge.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
          <Card
            hoverable
            className="flex-1 border-0 shadow-md overflow-hidden relative" // 确保 overflow-hidden 和 relative
            styles={{ body: { padding: 0, height: "100%" } }} // 重要：取消 padding 并设为 100%
          >
            <img
              className="w-full h-full object-cover"
              src={randomQuote.imageUrl}
              alt=""
            />
            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

            {/* 内容区域 */}
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="text-white">
                <p className="text-xl font-serif italic leading-relaxed mb-3">
                  {randomQuote.content}
                </p>
                <p className="text-white/80 text-sm mb-4">
                  {randomQuote.translation}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">
                    — {randomQuote.author}
                  </span>
                  <div
                    className="text-white hover:text-white cursor-pointer"
                    onClick={getRandomQuote}
                  >
                    换一句
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 热力图区域 */}
        <Card
          className="border-0 shadow-md"
          styles={{ body: { padding: "24px" } }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-700">学习热力图</h2>
            <span className="text-sm text-gray-400">过去一年的学习记录</span>
          </div>
          <ReactECharts
            option={heatmapOption}
            style={{ height: 280, width: "100%" }}
          />
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
