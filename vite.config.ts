import { resolve } from "node:path";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import basicSsl from "@vitejs/plugin-basic-ssl";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [cloudflare(), basicSsl(), tsconfigPaths()],
  clearScreen: true,
  envPrefix: "WEBFLOW",
  build: {
    minify: true,
    rollupOptions: {
      input: resolve(__dirname, "src/main.ts"),
      output: {
        entryFileNames: "main.js",
      },
    },
  },
  server: {
    host: process.env.NODE_ENV === "development" && "preview.localhost",
  },
});
