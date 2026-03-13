/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// import Sonda from 'sonda/vite';
// import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  base:
    process.env.NODE_ENV === 'production'
      ? 'https://denlahodnyi.github.io/budget-buddy/'
      : '/',
  build: {
    sourcemap: true,
  },
  plugins: [
    vue(),
    // Sonda({
    //   open: false,
    //   brotli: true,
    //   gzip: true,
    //   filename: 'stats_[index]',
    // }),
    // visualizer({ open: true, gzipSize: true, brotliSize: true, sourcemap: true }),
  ],
  resolve: {
    alias: {
      '~': new URL('./src', import.meta.url).toString(),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        importers: [
          {
            findFileUrl: (url) => {
              if (url.startsWith('@globals')) {
                // Allows importing global styles using @globals alias
                const partialsDir = url.replace('@globals', '');
                return new URL(
                  `./src/shared/styles/globals${partialsDir}`,
                  import.meta.url,
                );
              }
              return null;
            },
          },
        ],
      },
    },
  },
  test: {},
});
