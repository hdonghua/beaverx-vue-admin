import { defineStore } from 'pinia';
import {
  LoginRequest,
  login as userLogin,
  logout as userLogout,
  getProfile,
  UserProfileDto,
} from '@/api/server/auth';
import { setTokenPair, clearToken, getRefreshToken } from '@/utils/auth';
import { removeRouteListener } from '@/utils/route-listener';
import { stopRealtimeHub } from '@/utils/realtime-hub';
import { UserState } from './types';
import useAppStore from '../app';
import useTabBarStore from '../tab-bar';

function mapProfileToState(profile: UserProfileDto): Partial<UserState> {
  const isSuperAdmin = profile.roles.some(
    (role) => role.toLowerCase() === 'super_admin'
  );
  return {
    name: profile.nickName || profile.userName,
    avatar: profile.avatar || undefined,
    email: profile.email || undefined,
    phone: profile.phone || undefined,
    accountId: String(profile.id),
    role: isSuperAdmin ? '*' : profile.roles[0] || 'admin',
  };
}

const useUserStore = defineStore('user', {
  state: (): UserState => ({
    name: undefined,
    avatar: undefined,
    job: undefined,
    organization: undefined,
    location: undefined,
    email: undefined,
    introduction: undefined,
    personalWebsite: undefined,
    jobName: undefined,
    organizationName: undefined,
    locationName: undefined,
    phone: undefined,
    registrationDate: undefined,
    accountId: undefined,
    certification: undefined,
    role: '',
    permissions: [],
  }),

  getters: {
    userInfo(state: UserState): UserState {
      return { ...state };
    },
  },

  actions: {
    switchRoles() {
      return new Promise((resolve) => {
        this.role = this.role === 'user' ? 'admin' : 'user';
        resolve(this.role);
      });
    },
    setInfo(partial: Partial<UserState>) {
      this.$patch(partial);
    },

    resetInfo() {
      this.$reset();
    },

    applyProfile(profile: UserProfileDto) {
      this.setInfo({
        ...mapProfileToState(profile),
        permissions: profile.permissions,
      });
    },

    async info() {
      const { data } = await getProfile();
      this.applyProfile(data);
    },

    async login(loginForm: LoginRequest) {
      try {
        const { data } = await userLogin(loginForm);
        setTokenPair(data.token, data.refreshToken, data.expiresIn);
        this.applyProfile(data.user);
        const { startRealtimeHub } = await import('@/utils/realtime-hub');
        await startRealtimeHub();
      } catch (err) {
        clearToken();
        throw err;
      }
    },
    logoutCallBack() {
      const appStore = useAppStore();
      const tabBarStore = useTabBarStore();
      void stopRealtimeHub();
      this.resetInfo();
      clearToken();
      removeRouteListener();
      appStore.clearServerMenu();
      tabBarStore.resetTabList();
    },
    async logout() {
      try {
        await userLogout(getRefreshToken());
      } finally {
        this.logoutCallBack();
      }
    },
  },
});

export default useUserStore;
