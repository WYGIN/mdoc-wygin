import { defineConfig } from 'astro/config';
import mdoc from 'astro-mdoc';
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdoc()]
});