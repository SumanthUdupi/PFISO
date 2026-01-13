import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/PFISO/', // Set base path for GitHub Pages repo
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
