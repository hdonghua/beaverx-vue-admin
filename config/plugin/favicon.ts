import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import type { Plugin } from 'vite';

const faviconSrc = resolve(process.cwd(), 'src/assets/images/favicon.ico');

/** 开发用 /src/... 路径；构建时复制到 dist 根目录并改写 index.html */
export default function configFaviconPlugin(): Plugin {
  return {
    name: 'config-favicon',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '/src/assets/images/favicon.ico',
        '/favicon.ico'
      );
    },
    closeBundle() {
      if (!existsSync(faviconSrc)) {
        return;
      }
      const outDir = resolve(process.cwd(), 'dist');
      mkdirSync(outDir, { recursive: true });
      copyFileSync(faviconSrc, resolve(outDir, 'favicon.ico'));
    },
  };
}
