import pinia from './pinia';
import useAppStore from './modules/app';
import useAuthStore from './modules/auth';
import useUserStore from './modules/user';
import useTabBarStore from './modules/tab-bar';
import useFlowStore from './modules/flow';
import useOrganStore from './modules/organ';

export {
  useAppStore,
  useAuthStore,
  useUserStore,
  useTabBarStore,
  useFlowStore,
  useOrganStore,
};
export default pinia;
