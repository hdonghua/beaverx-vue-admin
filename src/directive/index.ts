import { App } from 'vue';
import permission from './permission';
import loading from './loading';

export default {
  install(Vue: App) {
    Vue.directive('permission', permission);
    Vue.directive('loading', loading);
  },
};
