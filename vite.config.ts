import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    allowedHosts: true,
    proxy: {
      // 匹配所有以 /api 开头的请求
      "/api": {
        target: "http://localhost:3001", // 你的后端接口地址
        changeOrigin: true, // 允许跨域
      },
    },
  },
  preview: {
    allowedHosts: true,
    port: 4173, // 确保端口固定
    host: true, // 监听所有地址，包括公网地址
  },
});
