import Sidebar from "@/components/Sidebar";
import { Outlet } from "react-router-dom";
import AIComponent from "@/components/AI/AIComponent";
import { useState } from "react";
import { Button, Drawer } from "antd";
import { MessageOutlined } from "@ant-design/icons";

export default function MainLayout() {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  return (
    <div className="h-screen w-screen bg-gray-100">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-[220px] bg-[#001529] text-white shrink-0 overflow-y-auto">
          <Sidebar />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          <Outlet />
        </div>

        {/* AI Drawer */}
        <Drawer
          title="AI Assistant"
          placement="right"
          onClose={() => setIsDrawerVisible(false)}
          open={isDrawerVisible}
          width={380}
        >
          <AIComponent />
        </Drawer>

        {/* Floating Button */}
        <Button
          type="primary"
          shape="circle"
          icon={<MessageOutlined />}
          size="large"
          className="fixed top-10 right-5 shadow-lg"
          onClick={() => setIsDrawerVisible(true)}
        />
      </div>
    </div>
  );
}
