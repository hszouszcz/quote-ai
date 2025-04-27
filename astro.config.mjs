// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";
import tailwindVite from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  adapter: node({
    mode: "standalone",
  }),
  vite: {
    plugins: [tailwindVite()],
  },
  experimental: {
    session: true,
  },
});
