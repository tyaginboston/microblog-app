import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config for GitHub Pages deployment
export default defineConfig({
  plugins: [react()],
  base: '/microblog-app/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
