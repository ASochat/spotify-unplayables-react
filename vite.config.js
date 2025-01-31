import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Remove the css/postcss configuration since it's now in postcss.config.js
  // Initially, I set up a proxy server to avoid rate limiting, but we used limitations of the package genius-lyrics-api instead
  // server: {
  //   proxy: {
  //     '/api/genius': {
  //       target: 'https://api.genius.com',
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/api\/genius/, ''),
  //     }
  //   }
  // }
  define: {
    'import.meta.env.API_URL': JSON.stringify(
      mode === 'production' 
        ? 'http://localhost:3001' 
        : 'http://localhost:3000'
    ),
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 3001,
  }
}))
