import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  server: { port: 5173, origin: 'http://localhost:5173', cors: { origin: '*' } },
  plugins: [
    react(),
    federation({
      name: 'marketmesh_shell',
      // use the name@url pattern and point to the remoteEntry.js in the remote root
      remotes: {
        catalog: 'catalog@http://localhost:5174/remoteEntry.js'
      },
      shared: { react: { singleton: true }, 'react-dom': { singleton: true } }
    })
  ]
});
