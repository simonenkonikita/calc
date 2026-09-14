// frontend/vite.config.ts

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createHtmlPlugin } from "vite-plugin-html";

export default defineConfig({
  plugins: [
    react(),
    createHtmlPlugin({
      minify: true,
      entry: "/src/main.tsx",
      template: "index.html",
    }),
  ],
  base: "/",
  build: {
    cssMinify: false,
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash].[ext]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        // 🔥 ОТКЛЮЧАЕМ БУФЕРИЗАЦИЮ
        selfHandleResponse: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            // Для SSE-запросов — особые заголовки
            if (req.url?.includes("/stream")) {
              proxyReq.setHeader("Connection", "keep-alive");
              proxyReq.setHeader("Cache-Control", "no-cache");
              proxyReq.setHeader("Accept", "text/event-stream");
            }
          });

          proxy.on("proxyRes", (proxyRes, req, res) => {
            // 🔥 Для SSE — отключаем буферизацию и чанкинг
            if (proxyRes.headers["content-type"]?.includes("text/event-stream")) {
              delete proxyRes.headers["content-length"];
              delete proxyRes.headers["content-encoding"];
              proxyRes.headers["cache-control"] = "no-cache";
              proxyRes.headers["connection"] = "keep-alive";
              proxyRes.headers["x-accel-buffering"] = "no";
              
              // Отключаем timeout для долгих соединений
              req.socket.setTimeout(0);
              req.socket.setNoDelay(true);
              req.socket.setKeepAlive(true);
            }
          });
        },
      },
    },
  },
});