// router/index.jsx
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Dashboard from "@/pages/Dashboard/Dashboard";
import AddWord from "@/pages/AddWord/AddWord";
import Quote from "@/pages/Quote/Quote";
import ReviewWord from "@/pages/ReviewWord/ReviewWord";
import WordManage from "@/pages/WordManage/WordManage";
// import User from "@/pages/User";
// import Setting from "@/pages/Setting";

const router = createBrowserRouter([
  {
    element: <MainLayout />, // 公共布局
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/addWord", element: <AddWord /> },
      { path: "/Quote", element: <Quote /> },
      { path: "/reviewWord", element: <ReviewWord /> },
      { path: "/wordManage", element: <WordManage /> },
      //   { path: "/setting", element: <Setting /> },
    ],
  },
]);
export default router;
