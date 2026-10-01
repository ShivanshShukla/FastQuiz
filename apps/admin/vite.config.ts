import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isMockOn = (env.MOCK_ON ?? env.VITE_MOCK_ON ?? "true") === "true";

  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_MOCK_ON": JSON.stringify(
        isMockOn ? "true" : "false",
      ),
      "import.meta.env.MOCK_ON": JSON.stringify(isMockOn ? "true" : "false"),
    },
    server: {
      port: 3001,
      host: true,
      proxy: {
        "/admin/auth": {
          target: env.VITE_AUTH_SERVICE_URL || "http://localhost:8001",
          changeOrigin: true,
        },
        "/api/quiz": {
          target: env.VITE_QUIZ_SERVICE_URL || "http://localhost:8002",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/quiz/, ""),
        },
        "/api/payments": {
          target: env.VITE_PAYMENTS_SERVICE_URL || "http://localhost:8003",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/payments/, ""),
        },
      },
    },
  };
});
