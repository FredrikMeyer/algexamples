import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { resolve } from "path";
import { getAllExamples, getAllTags, getAllFields } from "./app/lib/content.ts";
import { computeBacklinks } from "./app/lib/backlinks.ts";
import { processMarkdown } from "./app/lib/markdown.ts";

const base = process.env.VITE_BASE_PATH ?? "/";

const pages = (() => {
  try {
    const examples = getAllExamples();
    const tags = getAllTags();
    const fields = getAllFields();
    return [
      "/",
      "/examples/",
      "/varieties/",
      "/search",
      ...examples.map((e) => `/examples/${e.slug}`),
      ...fields.map((f) => `/fields/${f}`),
      ...tags.map((t) => `/tags/${t}`),
    ].map((path) => ({ path }));
  } catch {
    return ["/", "/examples/", "/varieties/"].map((path) => ({ path }));
  }
})();

export default defineConfig({
  base,
  resolve: {
    alias: { "~": resolve(import.meta.dirname, "app") },
  },
  plugins: [
    tanstackStart({
      srcDirectory: "app",
      pages,
      prerender: {
        enabled: true,
        crawlLinks: true,
        filter: (page) => !page.path.includes("?"),
      },
    }),
    viteReact(),
    tailwindcss(),
    {
      name: "algeo-data-dev",
      configureServer(server) {
        server.middlewares.use(`${base}data.json`, async (_req, res) => {
          try {
            const examples = getAllExamples();
            const backlinkMap = computeBacklinks(examples);
            const enriched = await Promise.all(
              examples.map(async (e) => ({
                ...e,
                html: await processMarkdown(e.body),
                backlinks: backlinkMap.get(e.slug) ?? [],
              })),
            );
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(enriched));
          } catch (err) {
            res.statusCode = 500;
            res.end(String(err));
          }
        });
      },
    },
  ],
});
