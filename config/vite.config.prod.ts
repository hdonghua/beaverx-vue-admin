import { mergeConfig } from 'vite';
import baseConfig from './vite.config.base';
import configCompressPlugin from './plugin/compress';
import configVisualizerPlugin from './plugin/visualizer';
import configArcoResolverPlugin from './plugin/arcoResolver';
import configImageminPlugin from './plugin/imagemin';
import configVersionPlugin from './plugin/version';

export default mergeConfig(
  {
    mode: 'production',
    plugins: [
      configCompressPlugin('gzip'),
      configVisualizerPlugin(),
      configArcoResolverPlugin(),
      configImageminPlugin(),
      configVersionPlugin(),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return;
            }
            if (id.includes('@arco-design/web-vue')) {
              return 'arco';
            }
            if (id.includes('echarts') || id.includes('vue-echarts')) {
              return 'chart';
            }
            if (
              id.includes('/vue/') ||
              id.includes('vue-router') ||
              id.includes('pinia') ||
              id.includes('@vueuse')
            ) {
              return 'vue';
            }
          },
        },
      },
      chunkSizeWarningLimit: 2000,
    },
  },
  baseConfig
);
