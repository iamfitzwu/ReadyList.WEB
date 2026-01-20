import * as path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import importMetaEnv from "@import-meta-env/unplugin";
import htmlPlugin from "vite-plugin-html-config";

const htmlPluginOpt = {
  headScripts: [
    "globalThis.import_meta_env = JSON.parse('\"import_meta_env_placeholder\"')",
  ],
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      importMetaEnv.vite({ example: ".env.example", env: ".env" }),
      htmlPlugin(htmlPluginOpt),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 3000,
      open: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      cors: true,
      proxy: {
        "/api/ReadyTime": {
          target: env.SERVER_URL,
          changeOrigin: true,
          secure: true,
          headers: {
            "X-API-KEY": env.TOKEN_KEY,
          },
          rewrite: (path) => path,
        },
      },
    },
  };
}); 