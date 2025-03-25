import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // 모든 IP 주소에서 접근 가능하게 설정
    port: 3000, // 원하는 포트 번호 설정 (선택사항)
  },
});
