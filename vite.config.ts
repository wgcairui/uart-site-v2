import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    proxy:{
      //"/api":"https://uart.ladishb.com"
      "/api":"http://localhost:9010"
    }
  }
})
