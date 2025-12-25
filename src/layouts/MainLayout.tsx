import Sidebar from "@/components/Sidebar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
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
      </div>
    </div>
  );
}
