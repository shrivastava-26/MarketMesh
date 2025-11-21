// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      // ...your federation config
    }),
  ],
  build: {
    target: 'esnext',      // *** THIS IS IMPORTANT ***
    modulePreload: false,  // often needed with federation
    // you can keep other build options you already have
  },
});
