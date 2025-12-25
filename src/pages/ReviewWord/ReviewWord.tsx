import { useEffect, useState } from "react";
import { Button, Progress, message, Spin, Input } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  SoundOutlined,
  ReloadOutlined,
  TrophyOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import api from "@/api";

interface Word {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech?: string[];
  meaning: string;
  example?: string;
}

type ReviewMode = "card" | "spell-en" | "spell-cn";

function ReviewWord() {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [stats, setStats] = useState({ remembered: 0, forgotten: 0 });

  // 拼写测试相关状态
  const [reviewMode, setReviewMode] = useState<ReviewMode>("card");
  const [inputValue, setInputValue] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    fetchReviewWords();
  }, []);

  const fetchReviewWords = async () => {
    setLoading(true);
    try {
      const res = await api.getReviewWords();
      const reviewWords = res.data.data || [];
      setWords(reviewWords);
      setCurrentIndex(0);
      setFlipped(false);
      setCompleted(false);
      setStats({ remembered: 0, forgotten: 0 });
      setInputValue("");
      setShowResult(false);
    } catch {
      message.error("获取复习单词失败");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (remembered: boolean) => {
    if (submitting) return;

    const currentWord = words[currentIndex];
    setSubmitting(true);

    try {
      await api.submitReview(currentWord.id, remembered);

      setStats((prev) => ({
        remembered: prev.remembered + (remembered ? 1 : 0),
        forgotten: prev.forgotten + (remembered ? 0 : 1),
      }));

      if (currentIndex < words.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setFlipped(false);
        setInputValue("");
        setShowResult(false);
      } else {
        setCompleted(true);
      }
    } catch {
      message.error("提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  // 跳转到下一个单词
  const goToNextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setFlipped(false);
      setInputValue("");
      setShowResult(false);
    } else {
      setCompleted(true);
    }
  };

  // 检查拼写
  const handleCheckSpelling = async () => {
    const currentWord = words[currentIndex];
    let correct = false;

    if (reviewMode === "spell-en") {
      // 检查英文拼写（忽略大小写和首尾空格）
      correct =
        inputValue.trim().toLowerCase() === currentWord.word.toLowerCase();
    } else if (reviewMode === "spell-cn") {
      // 检查中文释义（包含即可，更宽松的匹配）
      const userInput = inputValue.trim();
      const meaning = currentWord.meaning;
      correct =
        meaning.includes(userInput) ||
        userInput.includes(meaning) ||
        userInput === meaning;
    }

    setIsCorrect(correct);
    setShowResult(true);

    // 自动提交结果
    try {
      await api.submitReview(currentWord.id, correct);
      setStats((prev) => ({
        remembered: prev.remembered + (correct ? 1 : 0),
        forgotten: prev.forgotten + (correct ? 0 : 1),
      }));

      // 延迟后自动跳转到下一个单词
      setTimeout(() => {
        goToNextWord();
      }, 1000);
    } catch {
      message.error("提交失败");
    }
  };

  // 处理回车键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showResult && inputValue.trim()) {
      handleCheckSpelling();
    }
  };

  const currentWord = words[currentIndex];
  const progress =
    words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  // 加载中
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Spin size="large" />
      </div>
    );
  }

  // 没有需要复习的单词
  if (words.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div
            className="w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
            }}
          >
            <TrophyOutlined className="text-5xl text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">太棒了！</h2>
          <p className="text-gray-500 mb-8 text-lg">今天没有需要复习的单词</p>
          <Button
            size="large"
            shape="round"
            icon={<ReloadOutlined />}
            onClick={fetchReviewWords}
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              border: "none",
              color: "#fff",
              height: 48,
              padding: "0 32px",
              fontWeight: 500,
            }}
          >
            刷新检查
          </Button>
        </div>
      </div>
    );
  }

  // 复习完成
  if (completed) {
    const total = stats.remembered + stats.forgotten;
    const accuracy =
      total > 0 ? Math.round((stats.remembered / total) * 100) : 0;

    return (
      <div className="h-full flex flex-col items-center justify-center bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
        <div className="text-center max-w-md w-full">
          <div
            className="w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
            }}
          >
            <TrophyOutlined className="text-5xl text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">复习完成！</h2>
          <p className="text-gray-500 mb-8 text-lg">
            你已完成今日所有单词的复习
          </p>

          {/* 统计卡片 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl mb-8">
            <div className="grid grid-cols-3 gap-6 text-center mb-6">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <div className="text-4xl font-bold text-gray-800">{total}</div>
                <div className="text-sm text-gray-500 mt-1">总计</div>
              </div>
              <div className="p-4 bg-green-50 rounded-2xl">
                <div className="text-4xl font-bold text-green-500">
                  {stats.remembered}
                </div>
                <div className="text-sm text-gray-500 mt-1">记住</div>
              </div>
              <div className="p-4 bg-red-50 rounded-2xl">
                <div className="text-4xl font-bold text-red-500">
                  {stats.forgotten}
                </div>
                <div className="text-sm text-gray-500 mt-1">忘记</div>
              </div>
            </div>
            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center gap-3">
                <span className="text-gray-500 text-lg">正确率</span>
                <span
                  className="text-4xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {accuracy}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 渲染拼写测试模式
  const renderSpellMode = () => (
    <div className="flex-1 flex items-center justify-center">
      <div
        className="w-full max-w-2xl rounded-3xl p-10 flex flex-col items-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
          backdropFilter: "blur(10px)",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255,255,255,0.5)",
        }}
      >
        {/* 题目 */}
        <p className="text-sm text-gray-400 mb-4 tracking-wide">
          {reviewMode === "spell-en" ? "根据中文写英文" : "根据英文写中文"}
        </p>

        {reviewMode === "spell-en" ? (
          // 显示中文，输入英文
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              {currentWord.meaning}
            </h1>
            {currentWord.phonetic && (
              <div className="flex items-center gap-2 text-gray-400 mb-6">
                <SoundOutlined className="text-lg" />
                <span className="text-lg">{currentWord.phonetic}</span>
              </div>
            )}
          </>
        ) : (
          // 显示英文，输入中文
          <>
            <h1
              className="text-5xl font-bold mb-2"
              style={{
                background: "linear-gradient(135deg, #1f2937, #4b5563)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {currentWord.word}
            </h1>
            {currentWord.phonetic && (
              <div className="flex items-center gap-2 text-gray-400 mb-6">
                <SoundOutlined className="text-lg" />
                <span className="text-lg">{currentWord.phonetic}</span>
              </div>
            )}
          </>
        )}

        {/* 输入框 */}
        <div className="w-full max-w-md mt-4">
          <Input
            size="large"
            placeholder={
              reviewMode === "spell-en" ? "输入英文单词..." : "输入中文释义..."
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={showResult}
            className="text-center text-xl h-14 rounded-xl"
            style={{
              borderColor: showResult
                ? isCorrect
                  ? "#22c55e"
                  : "#ef4444"
                : undefined,
              backgroundColor: showResult
                ? isCorrect
                  ? "#f0fdf4"
                  : "#fef2f2"
                : undefined,
            }}
          />
        </div>

        {/* 结果显示 */}
        {showResult && (
          <div className="mt-6 text-center">
            {isCorrect ? (
              <div className="flex items-center gap-2 text-green-500 text-xl font-semibold">
                <CheckOutlined />
                正确！
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-red-500 text-xl font-semibold">
                  <CloseOutlined />
                  错误
                </div>
                <p className="text-gray-500">
                  正确答案：
                  <span className="font-semibold text-gray-800 ml-1">
                    {reviewMode === "spell-en"
                      ? currentWord.word
                      : currentWord.meaning}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* 检查按钮 */}
        {!showResult && (
          <Button
            type="primary"
            size="large"
            onClick={handleCheckSpelling}
            disabled={!inputValue.trim()}
            className="mt-6 h-12 px-10 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              border: "none",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            提交答案
          </Button>
        )}
      </div>
    </div>
  );

  // 渲染卡片模式
  const renderCardMode = () => (
    <div className="flex-1 flex items-center justify-center">
      <div
        className="w-full max-w-2xl cursor-pointer"
        onClick={() => setFlipped(!flipped)}
        style={{ perspective: "1000px" }}
      >
        <div
          className="relative w-full min-h-[380px] transition-all duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* 正面 - 单词 */}
          <div
            className="absolute inset-0 rounded-3xl p-10 flex flex-col items-center justify-center"
            style={{
              backfaceVisibility: "hidden",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
              backdropFilter: "blur(10px)",
              boxShadow:
                "0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255,255,255,0.5)",
            }}
          >
            <p className="text-sm text-gray-400 mb-6 tracking-wide">
              点击卡片查看释义
            </p>
            <h1
              className="text-6xl font-bold mb-6"
              style={{
                background: "linear-gradient(135deg, #1f2937, #4b5563)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {currentWord.word}
            </h1>
            {currentWord.phonetic && (
              <div className="flex items-center gap-2 text-gray-400 mb-4">
                <SoundOutlined className="text-lg" />
                <span className="text-xl">{currentWord.phonetic}</span>
              </div>
            )}
            {currentWord.partOfSpeech &&
              currentWord.partOfSpeech.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {currentWord.partOfSpeech.map((pos) => (
                    <span
                      key={pos}
                      className="px-4 py-1.5 rounded-full text-sm font-medium"
                      style={{
                        background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
                        color: "#6366f1",
                      }}
                    >
                      {pos}
                    </span>
                  ))}
                </div>
              )}
          </div>

          {/* 背面 - 释义 */}
          <div
            className="absolute inset-0 rounded-3xl p-10 flex flex-col items-center justify-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
              backdropFilter: "blur(10px)",
              boxShadow:
                "0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255,255,255,0.5)",
            }}
          >
            <p className="text-sm text-gray-400 mb-4 tracking-wide">释义</p>
            <h2
              className="text-3xl font-bold mb-4"
              style={{
                background: "linear-gradient(135deg, #1f2937, #4b5563)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {currentWord.word}
            </h2>
            <p className="text-2xl text-gray-600 text-center leading-relaxed mb-6">
              {currentWord.meaning}
            </p>
            {currentWord.example && (
              <div
                className="w-full p-5 rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                }}
              >
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                  Example
                </p>
                <p className="text-gray-600 italic leading-relaxed">
                  {currentWord.example}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      {/* 顶部进度 */}
      <div className="max-w-2xl mx-auto w-full mb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span
                className="text-2xl font-bold"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {currentIndex + 1}
              </span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-500 text-lg">{words.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 rounded-full">
                <CheckOutlined className="text-green-500 text-xs" />
                <span className="text-green-600 font-medium text-sm">
                  {stats.remembered}
                </span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-red-50 rounded-full">
                <CloseOutlined className="text-red-500 text-xs" />
                <span className="text-red-600 font-medium text-sm">
                  {stats.forgotten}
                </span>
              </div>
            </div>
          </div>
          <Progress
            percent={progress}
            showInfo={false}
            strokeColor={{
              "0%": "#6366f1",
              "100%": "#a855f7",
            }}
            size={["100%", 8]}
          />
        </div>
      </div>

      {/* 模式切换 */}
      <div className="max-w-2xl mx-auto w-full mb-4">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm flex gap-1">
          {[
            { value: "card", icon: <EyeOutlined />, label: "翻卡片" },
            { value: "spell-en", icon: <EditOutlined />, label: "拼写英文" },
            { value: "spell-cn", icon: <EditOutlined />, label: "写释义" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => {
                setReviewMode(item.value as ReviewMode);
                setInputValue("");
                setShowResult(false);
                setFlipped(false);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                reviewMode === item.value
                  ? "text-white shadow-md"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              }`}
              style={
                reviewMode === item.value
                  ? {
                      background:
                        "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    }
                  : {}
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 内容区域 */}
      {reviewMode === "card" ? renderCardMode() : renderSpellMode()}

      {/* 底部按钮 */}
      <div className="max-w-2xl mx-auto w-full mt-6">
        <div className="flex gap-6 justify-center">
          <button
            onClick={() => handleReview(false)}
            disabled={submitting || (reviewMode !== "card" && !showResult)}
            className={`flex-1 h-16 rounded-2xl text-lg font-semibold flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed ${
              reviewMode !== "card" && showResult && isCorrect
                ? "opacity-40"
                : reviewMode !== "card" && !showResult
                  ? "opacity-50"
                  : ""
            }`}
            style={{
              background:
                reviewMode !== "card" && showResult && !isCorrect
                  ? "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
                  : "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
              color:
                reviewMode !== "card" && showResult && !isCorrect
                  ? "#fff"
                  : "#ef4444",
              border:
                reviewMode !== "card" && showResult && !isCorrect
                  ? "none"
                  : "2px solid #fecaca",
              boxShadow:
                reviewMode !== "card" && showResult && !isCorrect
                  ? "0 4px 15px rgba(239, 68, 68, 0.4)"
                  : "0 4px 15px rgba(239, 68, 68, 0.15)",
            }}
          >
            <CloseOutlined className="text-xl" />
            没记住
          </button>
          <button
            onClick={() => handleReview(true)}
            disabled={submitting || (reviewMode !== "card" && !showResult)}
            className={`flex-1 h-16 rounded-2xl text-lg font-semibold flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed ${
              reviewMode !== "card" && showResult && !isCorrect
                ? "opacity-40"
                : reviewMode !== "card" && !showResult
                  ? "opacity-50"
                  : ""
            }`}
            style={{
              background:
                reviewMode !== "card" && showResult && isCorrect
                  ? "linear-gradient(135deg, #059669 0%, #10b981 100%)"
                  : "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
              color: "#fff",
              border: "none",
              boxShadow:
                reviewMode !== "card" && showResult && isCorrect
                  ? "0 4px 15px rgba(16, 185, 129, 0.5)"
                  : "0 4px 15px rgba(16, 185, 129, 0.3)",
              transform:
                reviewMode !== "card" && showResult && isCorrect
                  ? "scale(1.02)"
                  : undefined,
            }}
          >
            <CheckOutlined className="text-xl" />
            记住了
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewWord;