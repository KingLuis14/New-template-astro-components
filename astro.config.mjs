import { defineConfig } from 'astro/config';
import icon from "astro-icon";

import purgecss from "astro-purgecss";

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: {
      // Choose from Shiki's built-in themes (or add your own)
      // https://shiki.style/themes

      theme: 'tokyo-night',
      // Alternatively, provide multiple themes
      // See note below for using dual light/dark themes
      themes: {
        light: 'tokyo-night',
        dark: 'tokyo-night',
      },
      // Disable the default colors
      // https://shiki.style/guide/dual-themes#without-default-color
      // (Added in v4.12.0)
      defaultColor: false,
      // Add custom languages
      // Note: Shiki has countless langs built-in, including .astro!
      // https://shiki.style/languages
      langs: [],
      // Enable word wrap to prevent horizontal scrolling
      wrap: true,
      // Add custom transformers: https://shiki.style/guide/transformers
      // Find common transformers: https://shiki.style/packages/transformers
      transformers: [],
    },
  },
  devToolbar: {
    enabled: false,
  },
  // scopedStyleStrategy: 'where',
  integrations: [
    icon(),
    purgecss({
      extractors: [
        {
          extractor: (content) => content.match(/[^<>"'`\s]*[@:][^<>"'`\s]*|[^<>"'`\s]*[^<>"'`\s]/g) || [],
          extensions: ['astro', 'html'],
        },
      ],
    }),
  ],
});