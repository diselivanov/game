import { defineConfig } from "vite";
import restart from "vite-plugin-restart";

export default defineConfig({
  plugins: [
    restart({
      restart: ["src/**/*.{ts,tsx,js,jsx}", "index.html"],
    }),
  ],
  server: {
    port: 3000,
    open: true,
  },
});
