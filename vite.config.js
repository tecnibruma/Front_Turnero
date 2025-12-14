import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // ESTE BLOQUE ES VITAL para conectar con Spring Boot
    proxy: {
      '/api': { // Si la URL en React es /api/articulos
        target: 'http://localhost:8080', // Vite redirige la petición a tu Backend
        changeOrigin: true,
        secure: false, // Usar false si el backend no usa HTTPS
      },
    },
  },
});