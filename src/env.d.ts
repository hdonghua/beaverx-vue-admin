/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'vue3-dragscroll';

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

declare const __APP_BUILD_VERSION__: string;
