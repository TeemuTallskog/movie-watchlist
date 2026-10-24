import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative asset paths are required when index.html is loaded from a
  // moz-extension:// URL.
  base: './',
  build: {
    // Keep CRA's output directory so the existing packaging workflow works.
    outDir: 'build',
  },
  server: {
    port: 3000,
    strictPort: true,
  },
})
