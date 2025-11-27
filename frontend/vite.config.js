import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  // 🌟 ADD THIS NEW BUILD CONFIGURATION SECTION 🌟
  build: {
    // Uses the Terser minifier to optimize the production bundle
    minify: 'terser', 
    
    terserOptions: {
      compress: {
        // 👇 This automatically strips ALL console.log statements 👇
        drop_console: true, 
        drop_debugger: true,
      },
      // Optionally remove comments if you prefer
      format: {
        comments: false, 
      },
    },
  },
  // 🌟 END OF NEW SECTION 🌟
});