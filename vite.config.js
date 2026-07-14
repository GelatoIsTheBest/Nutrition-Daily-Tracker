import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative base so the built site works whether it's served from the
  // domain root (Vercel/Netlify) or a subpath like GitHub Pages project
  // sites (username.github.io/repo-name/).
  base: "./",
});
