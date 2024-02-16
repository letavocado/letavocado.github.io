import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://letavocado.github.io",

  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
  ],
  redirects: [{ from: "/", to: "./public/Amirzhan_Aliyev_SE_2024.docx" }],
});
