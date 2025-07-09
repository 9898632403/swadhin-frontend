import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000', // 👈 Flask backend URL
    },
  },
});
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: '0.0.0.0',
//     port: 5173,
//     strictPort: true,
//     proxy: {
//       '/api': 'http://localhost:5000',
//     },
//     allowedHosts: ['.ngrok-free.app'], // 👈 THIS allows all ngrok links (wildcard for subdomains)
//   },
// })
