/// <reference types="vitest/config" />

import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import reactVitest from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'index.ts'),
      name: 'VideoEditor',
      fileName: format => `video-editor.${format === 'es' ? 'js' : 'umd.cjs'}`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        assetFileNames: assetInfo => {
          // Generate both style.css and video-editor.css
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'style.css'
          }
          return assetInfo.name || 'asset-[name]-[hash][extname]'
        }
      }
    },
    sourcemap: true,
    emptyOutDir: true,
    cssCodeSplit: false
  },
  plugins: [
    react(),
    tailwindcss(),
    dts({
      outDir: ['dist', 'types'],
      rollupTypes: true,
      tsconfigPath: './tsconfig.app.json',
      staticImport: true,
      insertTypesEntry: true
    }),
    process.env.VITEST ? reactVitest() : undefined,
    tsconfigPaths(),
    {
      name: 'create-duplicate-css',
      generateBundle(_, bundle) {
        // Find the CSS asset
        const cssAsset = Object.values(bundle).find(asset => 'fileName' in asset && asset.fileName === 'style.css')

        // If we found the style.css file, duplicate it as video-editor.css
        if (cssAsset && 'source' in cssAsset) {
          this.emitFile({
            type: 'asset',
            fileName: 'video-editor.css',
            source: cssAsset.source
          })
          console.log('✅ Created video-editor.css from style.css')
        }
      }
    }
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src')
    }
  },
  test: {
    environment: 'jsdom',
    exclude: ['**/e2e/**', '**/node_modules/**', '**/e2e/**'],
    globals: true,
    setupFiles: ['./setup-tests.ts']
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
})
