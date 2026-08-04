import { Spin } from '@arco-design/web-vue';
import { createApp, h, type App, type Directive } from 'vue';

interface LoadingState {
  app: App;
  mask: HTMLDivElement;
  restorePosition: boolean;
}

const states = new WeakMap<HTMLElement, LoadingState>();

const loading: Directive<HTMLElement, boolean> = {
  mounted(element, binding) {
    const mask = document.createElement('div');
    const fullscreen = Boolean(binding.modifiers.fullscreen);
    Object.assign(mask.style, {
      position: fullscreen ? 'fixed' : 'absolute',
      inset: '0',
      zIndex: '2000',
      display: binding.value ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255, 255, 255, 0.78)',
    });

    const restorePosition = !fullscreen && getComputedStyle(element).position === 'static';
    if (restorePosition) element.style.position = 'relative';

    const app = createApp({
      render: () => h(Spin, { loading: true, tip: '加载中...' }),
    });
    app.mount(mask);
    (fullscreen ? document.body : element).appendChild(mask);
    states.set(element, { app, mask, restorePosition });
  },
  updated(element, binding) {
    const state = states.get(element);
    if (state) state.mask.style.display = binding.value ? 'flex' : 'none';
  },
  beforeUnmount(element) {
    const state = states.get(element);
    if (!state) return;
    state.app.unmount();
    state.mask.remove();
    if (state.restorePosition) element.style.removeProperty('position');
    states.delete(element);
  },
};

export default loading;
