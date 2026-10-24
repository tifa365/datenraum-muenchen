/*
 * This file is part of Civora UI.
 *
 * Copyright (C) 2025 DKSR GmbH.
 *
 * Civora UI is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    publicDir: 'public',
    plugins: [
      vue(),
      Icons({
        compiler: 'vue3',
      }),
      Components({
        dts: true,
        resolvers: [IconsResolver()],
        include: ['**/components/**/*.vue'],
        exclude: ['**/*.story.vue'],
      }),
      viteStaticCopy({
        targets: [
          {
            src: './src/assets/icons',
            dest: './src/assets',
          },
          {
            src: './src/assets/images',
            dest: './src/assets',
          },
          {
            src: './node_modules/tarteaucitronjs/tarteaucitron.js',
            dest: './tarteaucitron',
          },
          {
            src: './node_modules/tarteaucitronjs/tarteaucitron.min.js',
            dest: './tarteaucitron',
          },
          {
            src: './node_modules/tarteaucitronjs/tarteaucitron.services.js',
            dest: './tarteaucitron',
          },
          {
            src: './node_modules/tarteaucitronjs/tarteaucitron.services.min.js',
            dest: './tarteaucitron',
          },
          {
            src: './node_modules/tarteaucitronjs/advertising.js',
            dest: './tarteaucitron',
          },
          {
            src: './node_modules/tarteaucitronjs/advertising.min.js',
            dest: './tarteaucitron',
          },
          {
            src: './node_modules/tarteaucitronjs/css',
            dest: './tarteaucitron',
          },
          {
            src: './node_modules/tarteaucitronjs/lang',
            dest: './tarteaucitron',
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        vue: fileURLToPath(new URL('./node_modules/vue', import.meta.url)),
        '@config': fileURLToPath(new URL('./config', import.meta.url)),
        '@tests': fileURLToPath(new URL('./tests', import.meta.url)),
        'vue-router': fileURLToPath(new URL('./node_modules/vue-router', import.meta.url)),
        'vue-i18n': fileURLToPath(new URL('./node_modules/vue-i18n', import.meta.url)),
        '@formkit/vue': fileURLToPath(new URL('./node_modules/@formkit/vue', import.meta.url)),
        '@formkit/core': fileURLToPath(new URL('./node_modules/@formkit/core', import.meta.url)),
      },
    },
    server: {
      watch: {
        usePolling: true, // Aktiviert Polling für Dateisysteme, bei denen Events fehlen
        interval: 100,    // Polling-Intervall (optional)
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './vitest.setup.ts',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
      include: ['tests/**/*.spec.ts', 'tests/**/*.test.ts'],
      exclude: ['**/node_modules/**', '**/dist/**'],
    },
  }
})
