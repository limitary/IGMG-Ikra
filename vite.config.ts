import { cpSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Kopieert de lettertypen en cmaps van PDF.js naar de build, zodat PDF's
// zonder internet correct worden weergegeven.
function copyPdfjsAssets(): Plugin {
  return {
    name: 'copy-pdfjs-assets',
    apply: 'build',
    writeBundle(options) {
      const outDir = options.dir ?? resolve(__dirname, 'dist');
      for (const folder of ['cmaps', 'standard_fonts']) {
        cpSync(resolve(__dirname, 'node_modules/pdfjs-dist', folder), resolve(outDir, 'pdfjs', folder), {
          recursive: true,
        });
      }
    },
  };
}

// base './' zorgt dat alle paden relatief zijn, zodat de app werkt
// vanuit het geïnstalleerde pakket in plaats van vanaf een server.
export default defineConfig({
  base: './',
  plugins: [react(), copyPdfjsAssets()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0,
  },
});
