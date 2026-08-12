import { defineConfig }   from 'vite';
import react              from '@vitejs/plugin-react';
import path               from 'path';
import { fileURLToPath }  from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// -------------------------------------------------------------
// vite.config.mjs — Electron renderer build config
// Dev server runs on port 5173 (Vite default)
// Electron main process loads http://localhost:5173 in dev
// Production build outputs to dist-renderer/
// -------------------------------------------------------------
export default defineConfig({
    plugins: [react()],

    root: __dirname,

    base: './',

    server: {
        port:       5173,
        strictPort: true
    },

    build: {
        outDir:      path.join(__dirname, 'dist-renderer'),
        emptyOutDir: true
    },

    resolve: {
        alias: {
            '@': path.join(__dirname, 'editor')
        }
    },

    optimizeDeps: {
        entries: ['index.html']
    }
});
