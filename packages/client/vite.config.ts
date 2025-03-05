import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Try to read the server port from the file
let serverPort = 3000;
try {
  const portFilePath = path.resolve(__dirname, 'server-port.json');
  if (fs.existsSync(portFilePath)) {
    const portData = JSON.parse(fs.readFileSync(portFilePath, 'utf8'));
    serverPort = portData.port || 3000;
    console.log(`Using server port from file: ${serverPort}`);
  } else {
    console.log('Server port file not found, using default port 3000');
  }
} catch (error) {
  console.warn('Could not read server port from file, using default port 3000:', error);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: `http://localhost:${serverPort}`,
        changeOrigin: true,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      '@mui/material', 
      '@mui/icons-material',
      'date-fns',
      'axios',
      '@reduxjs/toolkit',
      'react-redux',
      '@mui/lab',
      '@mui/x-date-pickers/DatePicker',
      '@mui/x-date-pickers/LocalizationProvider',
      '@mui/x-date-pickers/AdapterDateFns',
      'react-hot-toast'
    ],
    force: true, // Force dependency pre-bundling
    esbuildOptions: {
      logLevel: 'info',
      target: 'es2020'
    }
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@mui/lab', '@mui/x-date-pickers'],
          utils: ['date-fns', 'axios']
        }
      }
    }
  },
  cacheDir: path.resolve(__dirname, 'node_modules/.vite_custom_cache')
}); 