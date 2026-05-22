import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Nếu deploy trên Vercel thì dùng '/', nếu trên GitHub Pages thì dùng '/Bo_Tieng_Nhat/'
  base: process.env.VERCEL ? '/' : '/Bo_Tieng_Nhat/',
})
