import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: 'http://localhost:3000/', // ✅ ده السطر اللي بيحل مشكلة GitHub Pages
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env': env
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    }
  };
});