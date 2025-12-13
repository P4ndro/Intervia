import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable websocket proxying
        timeout: 10000, // 10 second timeout
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            // Log error but don't crash - backend might be starting/stopping
            console.warn('[Vite Proxy] Backend connection error:', err.message);
            // If response object exists, send a helpful error
            if (res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                error: 'Backend server unavailable', 
                message: 'Make sure the server is running on http://localhost:3000' 
              }));
            }
          });
        },
      },
    },
  },
});

