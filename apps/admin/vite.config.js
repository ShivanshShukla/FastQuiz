import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig(function (_a) {
    var _b, _c;
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    var isMockOn = ((_c = (_b = env.MOCK_ON) !== null && _b !== void 0 ? _b : env.VITE_MOCK_ON) !== null && _c !== void 0 ? _c : 'true') === 'true';
    return {
        plugins: [react()],
        define: {
            'import.meta.env.VITE_MOCK_ON': JSON.stringify(isMockOn ? 'true' : 'false'),
            'import.meta.env.MOCK_ON': JSON.stringify(isMockOn ? 'true' : 'false'),
        },
        server: {
            port: 3001,
            host: true,
            proxy: {
                '/admin/auth': {
                    target: env.VITE_AUTH_SERVICE_URL || 'http://localhost:8001',
                    changeOrigin: true,
                },
                '/api/quiz': {
                    target: env.VITE_QUIZ_SERVICE_URL || 'http://localhost:8002',
                    changeOrigin: true,
                    rewrite: function (path) { return path.replace(/^\/api\/quiz/, ''); },
                },
                '/api/payments': {
                    target: env.VITE_PAYMENTS_SERVICE_URL || 'http://localhost:8003',
                    changeOrigin: true,
                    rewrite: function (path) { return path.replace(/^\/api\/payments/, ''); },
                },
            },
        },
    };
});
