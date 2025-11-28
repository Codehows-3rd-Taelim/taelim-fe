import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost",
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        rewrite: (path) => path.replace(/^\/api/, ""), //ex) :8080/api/carlist로 시작하는 주소의 /api를 빈문자로 변경
        changeOrigin: true
      }
    }
  }
})
