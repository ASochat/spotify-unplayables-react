import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    // replace({ 
    //   preventAssignment: true, 
    //   values: { 
    //     'process.env.VITE_API_KEY': JSON.stringify(process.env.VITE_API_KEY), 
    //   }, 
    // }),
    // replace({ 
    //   preventAssignment: true, 
    //   values: { 
    //     'process.env.VITE_API_KEY': JSON.stringify(process.env.VITE_API_KEY), 
    //   },
    //  })
  ],
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
})
