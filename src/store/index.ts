import { createPinia } from 'pinia';
import { createPersistPlugin } from './plugins/persist';
import useAppStore from './modules/app';
import useUserStore from './modules/user';
import useTabBarStore from './modules/tab-bar';

const pinia = createPinia();
pinia.use(createPersistPlugin());

export { useAppStore, useUserStore, useTabBarStore };
export default pinia;
