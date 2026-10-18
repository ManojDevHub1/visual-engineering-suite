import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: resolve(rootDir, 'website'),
  publicDir: resolve(rootDir, 'website/public'),
  build: {
    outDir: resolve(rootDir, 'website/dist'),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(rootDir, 'website/index.html')
      }
    }
  },
  server: {
    port: 3000,
    open: false
  },
  preview: {
    port: 4173
  }
});
