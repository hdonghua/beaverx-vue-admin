<template>
  <div class="user-panel">
    <div class="user-panel-left">
      <a-avatar :size="72" class="user-avatar">
        <img v-if="avatar" alt="avatar" :src="avatar" />
        <icon-user v-else :size="36" />
      </a-avatar>
      <div class="user-name">{{ displayName }}</div>
      <div class="user-account">{{ profile?.userName || '-' }}</div>
      <a-space v-if="profile?.roles?.length" wrap class="user-roles">
        <a-tag v-for="role in profile.roles" :key="role" size="small" color="arcoblue">
          {{ role }}
        </a-tag>
      </a-space>
    </div>
    <div class="user-panel-right">
      <a-row :gutter="[32, 20]">
        <a-col :xs="24" :sm="12" :md="8">
          <div class="info-item">
            <div class="info-label">账号</div>
            <div class="info-value">{{ profile?.userName || '-' }}</div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="8">
          <div class="info-item">
            <div class="info-label">昵称</div>
            <div class="info-value">{{ profile?.nickName || '-' }}</div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="8">
          <div class="info-item">
            <div class="info-label">邮箱</div>
            <div class="info-value">{{ profile?.email || '-' }}</div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="8">
          <div class="info-item">
            <div class="info-label">手机</div>
            <div class="info-value">{{ profile?.phone || '-' }}</div>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue';
  import { useUserStore } from '@/store';
  import { getProfile, UserProfileDto } from '@/api/server/auth';

  const userStore = useUserStore();
  const profile = ref<UserProfileDto | null>(null);

  const avatar = computed(() => profile.value?.avatar || userStore.avatar);
  const displayName = computed(
    () => profile.value?.nickName || profile.value?.userName || '用户'
  );

  const loadProfile = async () => {
    const { data } = await getProfile();
    profile.value = data;
  };

  onMounted(() => {
    loadProfile();
  });

  defineExpose({ loadProfile });
</script>

<style scoped lang="less">
  .user-panel {
    display: flex;
    gap: 40px;
    padding: 8px 4px 4px;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 24px;
    }
  }

  .user-panel-left {
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    align-items: center;
    width: 160px;
    padding-top: 4px;
  }

  .user-avatar {
    background-color: var(--color-fill-3);
  }

  .user-name {
    margin-top: 12px;
    color: var(--color-text-1);
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
  }

  .user-account {
    margin-top: 4px;
    color: var(--color-text-3);
    font-size: 13px;
    line-height: 20px;
  }

  .user-roles {
    justify-content: center;
    margin-top: 10px;
  }

  .user-panel-right {
    flex: 1;
    min-width: 0;
    padding-top: 8px;
  }

  .info-item {
    min-height: 44px;
  }

  .info-label {
    margin-bottom: 4px;
    color: var(--color-text-3);
    font-size: 13px;
    line-height: 20px;
  }

  .info-value {
    color: var(--color-text-1);
    font-size: 14px;
    line-height: 22px;
    word-break: break-all;
  }
</style>
