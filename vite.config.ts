/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
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
                  import.meta.url
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
