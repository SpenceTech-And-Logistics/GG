import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  // The manifest tells scripts/prerender.mjs where each photo ended up, for share images and the sitemap.
  build: { manifest: true },
})
