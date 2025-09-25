import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': 'https://lms-1-ki76.onrender.com',
    },
  },
  preview: {
    host: "0.0.0.0",
    port: process.env.PORT || 5173,
    allowedHosts: ["onelms-uode.onrender.com"], // add your Render domain
  },
})
