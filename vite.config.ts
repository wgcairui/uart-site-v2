import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const server = "https://uart.ladishb.com"
//const server = "http://localhost:9010"


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    host: '0.0.0.0',
    proxy: {
      "/api": server,
      "/client": server
    }
  },
  preview: {
    port: 9005,
    host: "0.0.0.0",
  },
  build: {
    emptyOutDir: true
  }

})
