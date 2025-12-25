import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Table,
  Popconfirm,
  Modal,
  Image,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  FileTextOutlined,
  PictureOutlined,
  TranslationOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import api from "@/api";
import { UploadButton } from "@/lib/uploadthing";
import "@uploadthing/react/styles.css";

const { TextArea } = Input;

interface QuoteFormData {
  content: string;
  translation: string;
  author: string;
  imageUrl?: string;
}

interface Quote extends QuoteFormData {
  id: string;
}

function AddQuote() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    setTableLoading(true);
    try {
      const res = await api.getQuotes();
      setQuotes(res.data.data || []);
    } catch {
      message.error("获取名言列表失败");
    } finally {
      setTableLoading(false);
    }
  };

  const handleSubmit = async (values: QuoteFormData) => {
    setLoading(true);
    try {
      if (editingQuote) {
        // 编辑模式
        const res = await api.updateQuote(editingQuote.id, {
          ...values,
          imageUrl: imageUrl,
        });
        if (res.status === 200) {
          message.success("名言更新成功!");
          handleModalClose();
          fetchQuotes();
        }
      } else {
        // 添加模式
        const res = await api.addQuote({
          ...values,
          imageUrl: imageUrl,
        });
        if (res.status === 200 || res.status === 201) {
          message.success("名言添加成功!");
          handleModalClose();
          fetchQuotes();
        }
      }
    } catch {
      message.error(editingQuote ? "更新失败，请重试" : "添加失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: Quote) => {
    setEditingQuote(record);
    setImageUrl(record.imageUrl || "");
    form.setFieldsValue({
      content: record.content,
      translation: record.translation,
      author: record.author,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteQuote(id);
      message.success("删除成功");
      fetchQuotes();
    } catch {
      message.error("删除失败");
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingQuote(null);
    form.resetFields();
    setImageUrl("");
  };

  const columns: ColumnsType<Quote> = [
    {
      title: "图片",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 80,
      render: (url: string) =>
        url ? (
          <Image
            src={url}
            alt=""
            width={48}
            height={48}
            className="rounded-lg object-cover"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <PictureOutlined className="text-gray-300 text-lg" />
          </div>
        ),
    },
    {
      title: "英文名言",
      dataIndex: "content",
      key: "content",
      render: (text: string) => (
        <p className="text-gray-700 leading-relaxed line-clamp-2 m-0">{text}</p>
      ),
    },
    {
      title: "中文翻译",
      dataIndex: "translation",
      key: "translation",
      render: (text: string) => (
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 m-0">
          {text}
        </p>
      ),
    },
    {
      title: "作者",
      dataIndex: "author",
      key: "author",
      width: 120,
      render: (text: string) => (
        <span className="text-gray-600 font-medium">{text}</span>
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
            description="确定要删除这条名言吗？"
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
              名言管理
            </h1>
            <p className="text-gray-400 text-sm mt-1 mb-0">
              共 {quotes.length} 条记录
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            添加名言
          </Button>
        </div>

        {/* 表格 */}
        <div className="bg-white rounded-xl shadow-sm">
          <Table
            columns={columns}
            dataSource={quotes}
            rowKey="_id"
            loading={tableLoading}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `共 ${total} 条`,
              showSizeChanger: false,
            }}
            className="[&_.ant-table-thead_th]:bg-gray-50 [&_.ant-table-thead_th]:text-gray-600 [&_.ant-table-thead_th]:font-medium"
          />
        </div>

        {/* 添加/编辑名言弹窗 */}
        <Modal
          title={
            <span className="text-lg font-semibold">
              {editingQuote ? "编辑名言" : "添加名言"}
            </span>
          }
          open={modalOpen}
          onCancel={handleModalClose}
          footer={null}
          width={480}
          destroyOnHidden
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            className="mt-4"
          >
            {/* 图片上传 */}
            <Form.Item
              label={
                <span className="text-gray-600 flex items-center gap-1.5">
                  <PictureOutlined className="text-gray-400" />
                  背景图片
                  <span className="text-gray-300 font-normal">（可选）</span>
                </span>
              }
            >
              {imageUrl ? (
                <div className="relative w-full h-36 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={imageUrl}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    size="small"
                    icon={<DeleteOutlined />}
                    className="absolute top-2 right-2"
                    onClick={() => setImageUrl("")}
                  >
                    移除
                  </Button>
                </div>
              ) : (
                <div className="border border-dashed border-gray-200 rounded-lg p-4 flex justify-center">
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      if (res && res[0]) {
                        setImageUrl(res[0].ufsUrl);
                        message.success("图片上传成功");
                      }
                    }}
                    onUploadError={(error: Error) => {
                      message.error(`上传失败: ${error.message}`);
                    }}
                  />
                </div>
              )}
            </Form.Item>

            {/* 英文内容 */}
            <Form.Item
              name="content"
              label={
                <span className="text-gray-600 flex items-center gap-1.5">
                  <FileTextOutlined className="text-gray-400" />
                  英文名言
                </span>
              }
              rules={[{ required: true, message: "请输入英文名言" }]}
            >
              <TextArea
                placeholder="The only way to do great work is to love what you do."
                rows={3}
                className="resize-none"
              />
            </Form.Item>

            {/* 中文翻译 */}
            <Form.Item
              name="translation"
              label={
                <span className="text-gray-600 flex items-center gap-1.5">
                  <TranslationOutlined className="text-gray-400" />
                  中文翻译
                </span>
              }
              rules={[{ required: true, message: "请输入中文翻译" }]}
            >
              <TextArea
                placeholder="成就伟大事业的唯一途径就是热爱你所做的事。"
                rows={2}
                className="resize-none"
              />
            </Form.Item>

            {/* 作者 */}
            <Form.Item
              name="author"
              label={
                <span className="text-gray-600 flex items-center gap-1.5">
                  <UserOutlined className="text-gray-400" />
                  作者
                </span>
              }
              rules={[{ required: true, message: "请输入作者" }]}
            >
              <Input placeholder="Steve Jobs" />
            </Form.Item>

            {/* 按钮 */}
            <Form.Item className="mb-0 mt-6 pt-4 border-t border-gray-100">
              <div className="flex justify-end gap-2">
                <Button onClick={handleModalClose}>取消</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingQuote ? "保存" : "添加"}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

export default AddQuote;
