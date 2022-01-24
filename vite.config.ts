import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginMomentToDayjs from 'vite-plugin-moment-to-dayjs'

const server = "https://uart.ladishb.com"
//const server = "http://localhost:9010"


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),vitePluginMomentToDayjs()],
  //base: "/v2",
  server: {
    open: true,
    host: '0.0.0.0',
    proxy: {
      "/api": server,
      "/client": server
    }
  },
  preview: {
    port: 9004,
    host: "0.0.0.0",
  },
  build: {
    emptyOutDir: true,
    rollupOptions: {
      /**
       * https://rollupjs.org/guide/en/#outputassetfilenames
       */
      output: {
        entryFileNames: `assets/[hash].js`,
        chunkFileNames: `assets/[hash].js`,
        assetFileNames: `assets/[hash].[name].[ext]`
      }
    }
  }

})
