import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANT: base must match your repo name for GitHub Pages
// e.g. if your repo is github.com/jubilancy/viz
// then base should be '/viz/'
export default defineConfig({
  plugins: [react()],
  base: '/viz/',
});
