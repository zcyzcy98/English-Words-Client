import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// 1. 定义接口（放在同一个文件没问题，只要不单独 export 它给外部非组件用）
interface ChatMessageProps {
  content: string;
}
const ChatMessage: React.FC<ChatMessageProps> = ({ content }) => {
  return (
    // 使用 prose 类名自动处理所有 Markdown 标签样式
    <div className="prose prose-slate max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
};

// 3. 必须有一个默认导出，或者只导出这一个组件
export default ChatMessage;
