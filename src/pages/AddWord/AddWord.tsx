import { useEffect, useState } from "react";
import { Form, Input, Button, Select, Card, message, Space, Tag } from "antd";
import {
  PlusOutlined,
  SoundOutlined,
  BookOutlined,
  EditOutlined,
  TagsOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import api from "@/api";

const { TextArea } = Input;
const { Option } = Select;

interface WordFormData {
  word: string;
  phonetic?: string;
  partOfSpeech: string[];
  meaning: string;
  example?: string;
}

const partOfSpeechOptions = [
  { value: "n.", label: "名词 (n.)", color: "blue" },
  { value: "v.", label: "动词 (v.)", color: "green" },
  { value: "adj.", label: "形容词 (adj.)", color: "orange" },
  { value: "adv.", label: "副词 (adv.)", color: "purple" },
  { value: "prep.", label: "介词 (prep.)", color: "cyan" },
  { value: "conj.", label: "连词 (conj.)", color: "magenta" },
  { value: "pron.", label: "代词 (pron.)", color: "gold" },
  { value: "interj.", label: "感叹词 (interj.)", color: "red" },
];

const categories = ["日常", "商务", "学术", "托福", "雅思", "四级", "六级"];

function AddWord() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [todayAddWordCount, setTodayAddWordCount] = useState(0);

  useEffect(() => {
    getTodayAddWordCount();
  }, []);

  const getTodayAddWordCount = async () => {
    const res = await api.getStats();
    setTodayAddWordCount(res.data.todayAdded);
  };

  const handleSubmit = async (values: WordFormData) => {
    setLoading(true);

    console.log(values);
    console.log({ ...values, category: selectedCategory });

    try {
      const res = await addWord({ ...values, category: selectedCategory });
      if (res) {
        form.resetFields();
        setSelectedCategory([]);
        getTodayAddWordCount();
      }
    } catch {
      message.error("添加失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const addWord = async (values: WordFormData & { category: string[] }) => {
    try {
      const res = await api.addWord({ ...values, category: selectedCategory });
      if (res.status === 200) {
        message.success("单词添加成功!");
        return res;
      }
    } catch {
      message.error("添加失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tag: string) => {
    if (selectedCategory.includes(tag)) {
      setSelectedCategory(selectedCategory.filter((t) => t !== tag));
    } else {
      setSelectedCategory([...selectedCategory, tag]);
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card
        className="w-full max-w-3xl shadow-xl border-0 rounded-2xl"
        styles={{ body: { padding: "32px 40px" } }}
      >
        {/* 页面标题 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">添加新单词</h1>
          <p className="text-gray-400 text-sm mt-1">记录学习的每一个英文单词</p>
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-linear-to-r from-blue-50 to-purple-50 rounded-full border border-blue-100">
            <span className="text-gray-500 text-sm">今日已添加</span>
            <span className="text-xl font-bold text-blue-500">
              {todayAddWordCount}
            </span>
            <span className="text-gray-500 text-sm">个单词</span>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          {/* 单词 + 音标 一行 */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="word"
              label={
                <span className="text-gray-600 font-medium flex items-center gap-1.5">
                  <BookOutlined className="text-blue-500" />
                  英文单词
                </span>
              }
              rules={[{ required: true, message: "请输入单词" }]}
            >
              <Input
                placeholder="serendipity"
                className="rounded-lg"
                style={{ fontSize: "16px" }}
              />
            </Form.Item>

            <Form.Item
              name="phonetic"
              label={
                <span className="text-gray-600 font-medium flex items-center gap-1.5">
                  <SoundOutlined className="text-green-500" />
                  音标
                </span>
              }
            >
              <Input placeholder="/ˌserənˈdɪpɪti/" className="rounded-lg" />
            </Form.Item>
          </div>

          {/* 词性 + 标签 一行 */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="partOfSpeech"
              label={
                <span className="text-gray-600 font-medium flex items-center gap-1.5">
                  <TagsOutlined className="text-orange-500" />
                  词性
                </span>
              }
              rules={[{ required: true, message: "请选择词性" }]}
            >
              <Select
                mode="multiple"
                placeholder="选择词性"
                className="rounded-lg"
                optionLabelProp="label"
              >
                {partOfSpeechOptions.map((pos) => (
                  <Option key={pos.value} value={pos.value} label={pos.value}>
                    <Tag color={pos.color}>{pos.label}</Tag>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={
                <span className="text-gray-600 font-medium flex items-center gap-1.5">
                  <TagsOutlined className="text-cyan-500" />
                  分类标签
                </span>
              }
            >
              <div className="flex flex-wrap gap-1.5">
                {categories.map((tag) => (
                  <Tag
                    key={tag}
                    color={selectedCategory.includes(tag) ? "blue" : "default"}
                    className="cursor-pointer rounded-full text-xs transition-all"
                    style={{
                      padding: "2px 10px",
                      borderStyle: "solid",
                    }}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            </Form.Item>
          </div>

          {/* 中文释义 */}
          <Form.Item
            name="meaning"
            label={
              <span className="text-gray-600 font-medium flex items-center gap-1.5">
                <EditOutlined className="text-purple-500" />
                中文释义
              </span>
            }
            rules={[{ required: true, message: "请输入释义" }]}
          >
            <Input
              placeholder="意外发现珍奇事物的本领；机缘凑巧"
              className="rounded-lg"
            />
          </Form.Item>

          {/* 例句 */}
          <Form.Item
            name="example"
            label={
              <span className="text-gray-600 font-medium flex items-center gap-1.5">
                <FileTextOutlined className="text-cyan-500" />
                例句（可选）
              </span>
            }
          >
            <TextArea
              placeholder="Finding that rare book was pure serendipity."
              rows={2}
              className="rounded-lg"
            />
          </Form.Item>

          {/* 按钮 */}
          <Form.Item className="mb-0 mt-6">
            <Space className="w-full justify-center">
              <Button
                className="rounded-lg px-6"
                onClick={() => {
                  form.resetFields();
                  setSelectedCategory([]);
                }}
              >
                重置
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<PlusOutlined />}
                className="rounded-lg px-8 bg-linear-to-r from-blue-500 to-purple-500 border-0 shadow-md hover:shadow-lg"
              >
                添加单词
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default AddWord;
