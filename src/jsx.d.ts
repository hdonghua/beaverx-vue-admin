import type { VNode } from 'vue';

declare global {
  namespace JSX {
    interface Element extends VNode {}

    interface IntrinsicElements {
      [elem: string]: unknown;
    }
  }
}

export {};
