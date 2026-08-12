import { defineConfig } from 'vite';
import react            from '@vitejs/plugin-react';
import path             from 'path';

// -------------------------------------------------------------
// vite.config.js — Electron renderer build config
// Dev server runs on port 5173 (Vite default)
// Electron main process loads http://localhost:5173 in dev
// Production build outputs to editor/dist-renderer/
// -------------------------------------------------------------
export default defineConfig({
    plugins: [react()],

    root: path.join(__dirname),

    base: './',

    server: {
        port: 5173,
        strictPort: true
    },

    build: {
        outDir:      path.join(__dirname, '..', 'dist-renderer'),
        emptyOutDir: true
    },

    resolve: {
        alias: {
            '@': path.join(__dirname, 'src')
        }
    }
});
