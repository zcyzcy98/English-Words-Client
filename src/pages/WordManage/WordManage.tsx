import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Tag,
  message,
  Table,
  Popconfirm,
  Modal,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SoundOutlined,
  BookOutlined,
  TagsOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import api from "@/api";

const { TextArea } = Input;
const { Option } = Select;

interface WordFormData {
  word: string;
  phonetic?: string;
  partOfSpeech: string[];
  meaning: string;
  example?: string;
  category?: string[];
}

interface Word extends WordFormData {
  id: string;
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

function WordManage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [words, setWords] = useState<Word[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    setTableLoading(true);
    try {
      const res = await api.getWords();
      setWords(res.data.data || []);
    } catch {
      message.error("获取单词列表失败");
    } finally {
      setTableLoading(false);
    }
  };

  const handleSubmit = async (values: WordFormData) => {
    setLoading(true);
    try {
      if (editingWord) {
        const res = await api.updateWord(editingWord.id, {
          ...values,
          category: selectedCategory,
        });
        if (res.status === 200) {
          message.success("单词更新成功!");
          handleModalClose();
          fetchWords();
        }
      } else {
        const res = await api.addWord({
          ...values,
          category: selectedCategory,
        });
        if (res.status === 200 || res.status === 201) {
          message.success("单词添加成功!");
          handleModalClose();
          fetchWords();
        }
      }
    } catch {
      message.error(editingWord ? "更新失败，请重试" : "添加失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: Word) => {
    setEditingWord(record);
    setSelectedCategory(record.category || []);
    form.setFieldsValue({
      word: record.word,
      phonetic: record.phonetic,
      partOfSpeech: record.partOfSpeech,
      meaning: record.meaning,
      example: record.example,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteWord(id);
      message.success("删除成功");
      fetchWords();
    } catch {
      message.error("删除失败");
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingWord(null);
    setSelectedCategory([]);
    form.resetFields();
  };

  const handleTagClick = (tag: string) => {
    if (selectedCategory.includes(tag)) {
      setSelectedCategory(selectedCategory.filter((t) => t !== tag));
    } else {
      setSelectedCategory([...selectedCategory, tag]);
    }
  };

  const columns: ColumnsType<Word> = [
    {
      title: "单词",
      dataIndex: "word",
      key: "word",
      width: 150,
      render: (text: string, record: Word) => (
        <div>
          <div className="font-semibold text-gray-800">{text}</div>
          {record.phonetic && (
            <div className="text-xs text-gray-400">{record.phonetic}</div>
          )}
        </div>
      ),
    },
    {
      title: "词性",
      dataIndex: "partOfSpeech",
      key: "partOfSpeech",
      width: 120,
      render: (pos: string[]) => (
        <div className="flex flex-wrap gap-1">
          {pos?.map((p) => {
            const option = partOfSpeechOptions.find((o) => o.value === p);
            return (
              <Tag key={p} color={option?.color || "default"} className="m-0">
                {p}
              </Tag>
            );
          })}
        </div>
      ),
    },
    {
      title: "释义",
      dataIndex: "meaning",
      key: "meaning",
      render: (text: string) => (
        <p className="text-gray-600 line-clamp-2 m-0">{text}</p>
      ),
    },
    {
      title: "例句",
      dataIndex: "example",
      key: "example",
      render: (text: string) =>
        text ? (
          <p className="text-gray-400 text-sm line-clamp-2 m-0 italic">
            {text}
          </p>
        ) : (
          <span className="text-gray-300">-</span>
        ),
    },
    {
      title: "分类",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (cats: string[]) => (
        <div className="flex flex-wrap gap-1">
          {cats?.map((c) => (
            <Tag key={c} className="m-0">
              {c}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      render: (_, record) => (
        <div className="flex gap-1">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            className="text-gray-400 hover:text-blue-500"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="删除确认"
            description="确定要删除这个单词吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              className="text-gray-400 hover:text-red-500"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full bg-gray-50 p-6 overflow-auto">
      <div className="w-full">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 m-0">
              单词管理
            </h1>
            <p className="text-gray-400 text-sm mt-1 mb-0">
              共 {words.length} 个单词
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            添加单词
          </Button>
        </div>

        {/* 表格 */}
        <div className="bg-white rounded-xl shadow-sm">
          <Table
            columns={columns}
            dataSource={words}
            rowKey="id"
            loading={tableLoading}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `共 ${total} 条`,
              showSizeChanger: false,
            }}
            className="[&_.ant-table-thead_th]:bg-gray-50 [&_.ant-table-thead_th]:text-gray-600 [&_.ant-table-thead_th]:font-medium"
          />
        </div>

        {/* 添加/编辑单词弹窗 */}
        <Modal
          title={
            <span className="text-lg font-semibold">
              {editingWord ? "编辑单词" : "添加单词"}
            </span>
          }
          open={modalOpen}
          onCancel={handleModalClose}
          footer={null}
          width={560}
          destroyOnHidden
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            className="mt-4"
          >
            {/* 单词 + 音标 */}
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="word"
                label={
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <BookOutlined className="text-blue-500" />
                    英文单词
                  </span>
                }
                rules={[{ required: true, message: "请输入单词" }]}
              >
                <Input placeholder="serendipity" />
              </Form.Item>

              <Form.Item
                name="phonetic"
                label={
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <SoundOutlined className="text-green-500" />
                    音标
                  </span>
                }
              >
                <Input placeholder="/ˌserənˈdɪpɪti/" />
              </Form.Item>
            </div>

            {/* 词性 */}
            <Form.Item
              name="partOfSpeech"
              label={
                <span className="text-gray-600 flex items-center gap-1.5">
                  <TagsOutlined className="text-orange-500" />
                  词性
                </span>
              }
              rules={[{ required: true, message: "请选择词性" }]}
            >
              <Select
                mode="multiple"
                placeholder="选择词性"
                optionLabelProp="label"
              >
                {partOfSpeechOptions.map((pos) => (
                  <Option key={pos.value} value={pos.value} label={pos.value}>
                    <Tag color={pos.color}>{pos.label}</Tag>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* 分类标签 */}
            <Form.Item
              label={
                <span className="text-gray-600 flex items-center gap-1.5">
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
                    style={{ padding: "2px 10px" }}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            </Form.Item>

            {/* 中文释义 */}
            <Form.Item
              name="meaning"
              label={
                <span className="text-gray-600 flex items-center gap-1.5">
                  <FileTextOutlined className="text-purple-500" />
                  中文释义
                </span>
              }
              rules={[{ required: true, message: "请输入释义" }]}
            >
              <Input placeholder="意外发现珍奇事物的本领；机缘凑巧" />
            </Form.Item>

            {/* 例句 */}
            <Form.Item
              name="example"
              label={
                <span className="text-gray-600 flex items-center gap-1.5">
                  <FileTextOutlined className="text-cyan-500" />
                  例句（可选）
                </span>
              }
            >
              <TextArea
                placeholder="Finding that rare book was pure serendipity."
                rows={2}
                className="resize-none"
              />
            </Form.Item>

            {/* 按钮 */}
            <Form.Item className="mb-0 mt-6 pt-4 border-t border-gray-100">
              <div className="flex justify-end gap-2">
                <Button onClick={handleModalClose}>取消</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingWord ? "保存" : "添加"}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

export default WordManage;
