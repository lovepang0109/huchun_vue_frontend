import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import DefineOptions from 'unplugin-vue-define-options/vite'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from 'vite'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import vuetify from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default ({ mode }) => {
  
  const env = loadEnv(mode, process.cwd(), "");

  return defineConfig({
    plugins: [
      vue(),
      vueJsx(),    
      vuetify({
        styles: {
          configFile: 'src/styles/variables/_vuetify.scss',
        },
        autoImport: true
      }),
      Pages({
        dirs: ['./src/pages'],
      }),
      Layouts({
        layoutsDirs: './src/layouts/',
      }),
      Components({
        dirs: ['src/@core/components', 'src/views/demos'],
        dts: true,
      }),
      AutoImport({
        eslintrc: {
          enabled: true,
          filepath: './.eslintrc-auto-import.json',
        },
        imports: ['vue', 'vuex', 'vue-router', '@vueuse/core', '@vueuse/math' ],
        vueTemplate: true,
      }),
      DefineOptions(),
    ],
    define: { 'process.env': env },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@themeConfig': fileURLToPath(new URL('./themeConfig.js', import.meta.url)),
        '@core': fileURLToPath(new URL('./src/@core', import.meta.url)),
        '@layouts': fileURLToPath(new URL('./src/@layouts', import.meta.url)),
        '@images': fileURLToPath(new URL('./src/assets/images/', import.meta.url)),
        '@styles': fileURLToPath(new URL('./src/styles/', import.meta.url)),
        '@configured-variables': fileURLToPath(new URL('./src/styles/variables/_template.scss', import.meta.url)),
        '@axios': fileURLToPath(new URL('./src/plugins/axios', import.meta.url)),
        '@validators': fileURLToPath(new URL('./src/@core/utils/validators', import.meta.url)),
        'apexcharts': fileURLToPath(new URL('node_modules/apexcharts-clevision', import.meta.url)),
      },
    },
    build: {
      chunkSizeWarningLimit: 5000,
    },
    optimizeDeps: {
      exclude: ['vuetify'],
      entries: [
        './src/**/*.vue',
      ],
      loader: { '.js': 'jsx' }
    },
    esbuild: {
      loader: "tsx",
      include: [
        // Business as usual for .jsx and .tsx files
        "src/**/*.jsx",
        "src/**/*.tsx",
        "node_modules/**/*.jsx",
        "node_modules/**/*.tsx",
  
        // Add these lines to allow all .js files to contain JSX
        "src/**/*.js",
        "node_modules/**/*.js",
  
        // Add these lines to allow all .ts files to contain JSX
        "src/**/*.ts",
        "node_modules/**/*.ts",
      ],
    }
  });
}
