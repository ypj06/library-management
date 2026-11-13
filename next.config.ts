import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 本项目采用传统的动态渲染：页面中一旦调用 cookies()，该路由即在请求时渲染。
  // 脚手架默认开启的 cacheComponents（Cache Components / PPR）会强制每个读取
  // Session 的页面包裹 Suspense 边界并参与构建期校验，对课程作业而言增加了
  // 不必要的理解成本，因此这里显式关闭，保持“一次请求一次渲染”的直观模型。
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
