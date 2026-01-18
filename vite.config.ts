import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  return {
    plugins: [react()],
    base: isDev ? '/' : '/PFISO/', // '/' for local dev, '/PFISO/' for GitHub Pages
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    }
  }
})
