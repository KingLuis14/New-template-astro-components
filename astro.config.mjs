import { defineConfig } from 'astro/config';
import icon from "astro-icon";

import purgecss from "astro-purgecss";

// https://astro.build/config
export default defineConfig({
  
  devToolbar: {
    enabled: false
  },
  // scopedStyleStrategy: 'where',
  integrations: [icon(), purgecss({
    extractors : [
      {
        extractor: (content) => 
          content.match(/[^<>"'`\s]*[@:][^<>"'`\s]*|[^<>"'`\s]*[^<>"'`\s]/g) || [],
          extensions: ["astro", "html"],
      }
    ]
  })]
});