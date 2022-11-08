import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        transformAssetUrls, compilerOptions: {
          // treat all tags with a dash as custom elements
          isCustomElement: (tag) => tag === 'math-field'
        }
      }
    }),

    quasar({
      sassVariables: 'src/quasar-variables.sass'
    })
  ],
  build: {
    chunkSizeWarningLimit: 1600,
  },
})
