import { createPinia } from 'pinia';
import useAppStore from './modules/app';
import useUserStore from './modules/user';
import useTabBarStore from './modules/tab-bar';
import useOrganStore from "./modules/organ";

const pinia = createPinia();

export { useAppStore, useUserStore, useTabBarStore, useOrganStore };
export default pinia;
