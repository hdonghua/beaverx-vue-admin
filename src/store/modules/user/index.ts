import { defineStore } from 'pinia';
import {
  LoginRequest,
  login as userLogin,
  logout as userLogout,
  getProfile,
  UserProfileDto,
} from '@/api/server/auth';
import { setToken, clearToken } from '@/utils/auth';
import { removeRouteListener } from '@/utils/route-listener';
import { UserState } from './types';
import useAppStore from '../app';

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
        setToken(data.token);
        this.applyProfile(data.user);
      } catch (err) {
        clearToken();
        throw err;
      }
    },
    logoutCallBack() {
      const appStore = useAppStore();
      this.resetInfo();
      clearToken();
      removeRouteListener();
      appStore.clearServerMenu();
    },
    async logout() {
      try {
        await userLogout();
      } finally {
        this.logoutCallBack();
      }
    },
  },
});

export default useUserStore;
