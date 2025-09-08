import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: ['@vladmandic/face-api', '@tensorflow/tfjs'] 
    }
  },
  optimizeDeps: {
    include: ['@tensorflow/tfjs', '@vladmandic/face-api']
  }
})