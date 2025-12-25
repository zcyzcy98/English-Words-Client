import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useMemo } from "react";

type MenuItem = {
  key: string;
  label: string;
  path: string;
};

const items: MenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/",
  },
  {
    key: "add-word",
    label: "Add Word",
    path: "/addWord",
  },
  {
    key: "word-manage",
    label: "Word Manage",
    path: "/wordManage",
  },
  {
    key: "review-word",
    label: "Review Word",
    path: "/reviewWord",
  },
  {
    key: "quote",
    label: "Quote",
    path: "/Quote",
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // 根据当前路径获取选中的菜单 key
  const selectedKey = useMemo(() => {
    const currentPath = location.pathname;
    const matchedItem = items.find((item) => item.path === currentPath);
    return matchedItem?.key || "dashboard";
  }, [location.pathname]);

  const onClick = ({ key }: { key: string }) => {
    navigate(items.find((item) => item.key === key)?.path || "/");
  };

  return (
    <>
      <div className="p-4 flex items-center">
        <img
          src="/English.png"
          alt="English Dictionary"
          className="w-8 h-8 mr-2"
        />
        English Dictionary
      </div>
      <Menu
        style={{ width: 256 }}
        selectedKeys={[selectedKey]}
        mode="inline"
        theme="dark"
        items={items}
        onClick={onClick}
      />
    </>
  );
}
