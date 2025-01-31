import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
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
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    'import.meta.env.API_URL': JSON.stringify(
      mode === 'production' 
        ? 'http://localhost:3001' 
        : 'http://localhost:3000'
    ),
  },
  preview: {
    port: 3001,
  }
}));
