import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    // 1. Existing Terser Optimization
    minify: 'terser', 
    terserOptions: {
      compress: {
        drop_console: true, 
        drop_debugger: true,
      },
      format: {
        comments: false, 
      },
    },

    // 2. NEW: Performance & Chunk Optimization for Vite 8
    chunkSizeWarningLimit: 1000, // Raises the warning limit to 1MB
    rolldownOptions: {
      output: {
        // This splits your heavy libraries (React, Framer Motion, etc.) 
        // into a separate file so the main page loads faster.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});