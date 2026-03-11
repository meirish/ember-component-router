import { defineConfig } from 'vite';
import { extensions, ember, classicEmberSupport } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import mkcert from 'vite-plugin-mkcert';

const __dirname = dirname(fileURLToPath(import.meta.url));

// For scenario testing
const isCompat = Boolean(process.env.ENABLE_COMPAT_BUILD);

export default defineConfig({
  plugins: [
    mkcert(),
    ...(isCompat ? [classicEmberSupport()] : []),
    ember(),
    babel({
      babelHelpers: 'inline',
      extensions,
    }),
  ],
  resolve: {
    alias: [
      {
        find: 'ember-component-router/routes',
        replacement: resolve(__dirname, 'src/routes.ts'),
      },
      {
        find: 'ember-component-router',
        replacement: resolve(__dirname, 'src/index.ts'),
      },
    ],
  },
  build: {
    rollupOptions: {
      input: {
        tests: 'tests/index.html',
      },
    },
  },
});
