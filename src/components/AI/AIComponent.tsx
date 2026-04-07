import React, { useState, useRef, useEffect } from "react";
import { Input, List, Spin, Avatar } from "antd";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import ChatMessage from "../markdown";
import api from "@/api";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  status?: "loading" | "streaming" | "done"; // 增加状态标识
}

const AIComponent = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "aiResponseId",
      text: "Welcome! Ask me anything.",
      sender: "ai",
      status: "done",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userPrompt = input;
    const requestId = Date.now().toString(); // 简单的 ID
    const aiResponseId = (Date.now() + 1).toString();

    // 1. 放入用户消息，并预置一个处于 loading 状态的 AI 消息
    setMessages((prev) => [
      ...prev,
      { id: requestId, text: userPrompt, sender: "user" },
      { id: aiResponseId, text: "", sender: "ai", status: "loading" },
    ]);

    setInput("");

    try {
      const res = await api.chat({
        prompt: input,
        sessionId: 'zcy',
      });

      console.log(res);

      // if (!res.body) return;

      // const reader = res.body.getReader();
      // const decoder = new TextDecoder();
      // let currentText = ""; // 用来记录累积的内容

      // while (true) {
      //   const { value, done } = await reader.read();
      //   if (done) break;

      //   const chunk = decoder.decode(value);
      //   currentText += chunk;

      //   // 2. 这里的更新逻辑非常精准：只根据 ID 更新那条 AI 消息
      //   setMessages((prev) =>
      //     prev.map((msg) =>
      //       msg.id === aiResponseId
      //         ? { ...msg, text: currentText, status: "streaming" }
      //         : msg,
      //     ),
      //   );
      // }

      // // 3. 结束后标记为 done
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiResponseId
            ? { ...msg, text: res.data.data, status: "done" }
            : msg,
        ),
      );
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: Message = {
        id: aiResponseId,
        text: "Sorry, something went wrong.",
        sender: "ai",
        status: "done",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-full flex flex-col">
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <List
          dataSource={messages}
          renderItem={(item) => (
            <div
              className={`flex w-full mb-6 ${item.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[85%] ${item.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* 头像部分：始终显示 */}
                <Avatar
                  icon={
                    item.sender === "user" ? (
                      <UserOutlined />
                    ) : (
                      <RobotOutlined />
                    )
                  }
                  className={`flex-shrink-0 ${item.sender === "user" ? "ml-3" : "mr-3"}`}
                  style={{
                    backgroundColor:
                      item.sender === "user" ? "#1890ff" : "#f56a00",
                  }}
                />

                {/* 消息内容区 */}
                <div
                  className={`relative p-3 rounded-2xl shadow-sm ${
                    item.sender === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                  }`}
                >
                  {/* 状态判断 */}
                  {item.status === "loading" ? (
                    <div className="flex items-center space-x-2 px-2 py-1">
                      <Spin size="small" />
                      <span className="text-gray-400 text-sm">正在思考...</span>
                    </div>
                  ) : (
                    <>
                      <ChatMessage content={item.text} />
                      {/* 如果正在流式输出，加一个打字机光标 */}
                      {item.status === "streaming" && (
                        <span className="inline-block w-1.5 h-4 ml-1 bg-blue-400 animate-pulse align-middle" />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        />
      </div>
      <div className="p-4">
        <Input.Search
          placeholder="Type your message..."
          enterButton="Send"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSearch={handleSend}
          loading={isLoading}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default AIComponent;
