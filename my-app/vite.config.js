// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  server: {
    https: fs.existsSync('./localhost.pem') && fs.existsSync('./localhost-key.pem') ? {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    } : undefined,
    host: 'localhost',
    port: 5173
  }
})