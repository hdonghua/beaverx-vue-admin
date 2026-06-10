import pinia from './pinia';
import useAppStore from './modules/app';
import useAuthStore from './modules/auth';
import useUserStore from './modules/user';
import useTabBarStore from './modules/tab-bar';

export { useAppStore, useAuthStore, useUserStore, useTabBarStore };
export default pinia;
