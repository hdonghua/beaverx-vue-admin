import { mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import type { Plugin } from 'vite';

/** 生产构建时写入 version.json，并注入 __APP_BUILD_VERSION__ 供前端比对 */
export default function configVersionPlugin(): Plugin {
  let buildVersion = '';

  return {
    name: 'app-version',
    apply: 'build',
    config() {
      buildVersion = `${Date.now()}`;
      return {
        define: {
          __APP_BUILD_VERSION__: JSON.stringify(buildVersion),
        },
      };
    },
    closeBundle() {
      if (!buildVersion) {
        return;
      }
      const outDir = resolve(process.cwd(), 'dist');
      mkdirSync(outDir, { recursive: true });
      writeFileSync(
        resolve(outDir, 'version.json'),
        JSON.stringify({ version: buildVersion }),
        'utf-8'
      );
    },
  };
}
