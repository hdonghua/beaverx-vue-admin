<template>
  <div class="user-panel">
    <div class="user-panel-left">
      <a-upload
        v-if="avatarEnabled"
        :show-file-list="false"
        accept="image/*"
        :disabled="avatarUploading"
        :custom-request="handleAvatarUpload"
      >
        <template #upload-button>
          <div class="avatar-upload-wrap">
            <a-avatar :size="72" class="user-avatar">
              <img v-if="avatarSrc" alt="avatar" :src="avatarSrc" />
              <icon-user v-else :size="36" />
            </a-avatar>
            <div class="avatar-upload-mask">
              <icon-camera v-if="!avatarUploading" :size="20" />
              <icon-loading v-else :size="20" spin />
            </div>
          </div>
        </template>
      </a-upload>
      <a-avatar v-else :size="72" class="user-avatar">
        <img v-if="avatarSrc" alt="avatar" :src="avatarSrc" />
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
  import { Message } from '@arco-design/web-vue';
  import type { RequestOption } from '@arco-design/web-vue/es/upload/interfaces';
  import { useAppStore, useUserStore } from '@/store';
  import {
    getProfile,
    updateProfile,
    UserProfileDto,
  } from '@/api/server/auth';
  import { uploadFile } from '@/api/server/common/file';
  import { resolveApiUrl } from '@/utils/asset-url';

  const emit = defineEmits<{ avatarUpdated: [] }>();

  const appStore = useAppStore();
  const userStore = useUserStore();
  const profile = ref<UserProfileDto | null>(null);
  const avatarUploading = ref(false);

  const avatarEnabled = computed(() => appStore.avatarEnabled);

  const avatarSrc = computed(() => {
    const raw = profile.value?.avatar || userStore.avatar;
    return resolveApiUrl(raw);
  });

  const displayName = computed(
    () => profile.value?.nickName || profile.value?.userName || '用户'
  );

  const loadProfile = async () => {
    const { data } = await getProfile();
    profile.value = data;
  };

  const handleAvatarUpload = (option: RequestOption) => {
    const { fileItem, onError, onSuccess } = option;
    const file = fileItem.file;
    if (!file) {
      onError(new Error('未选择文件'));
      return { abort: () => {} };
    }

    avatarUploading.value = true;
    let aborted = false;

    uploadFile(file, 'avatar')
      .then(({ data: uploadResult }) =>
        updateProfile({ avatar: uploadResult.proxyUrl })
      )
      .then(({ data }) => {
        if (aborted) {
          return;
        }
        profile.value = data;
        userStore.applyProfile(data);
        Message.success('头像更新成功');
        emit('avatarUpdated');
        onSuccess();
      })
      .catch((err: Error) => {
        if (!aborted) {
          onError(err);
        }
      })
      .finally(() => {
        if (!aborted) {
          avatarUploading.value = false;
        }
      });

    return {
      abort: () => {
        aborted = true;
        avatarUploading.value = false;
      },
    };
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

  .avatar-upload-wrap {
    position: relative;
    cursor: pointer;

    &:hover .avatar-upload-mask {
      opacity: 1;
    }
  }

  .avatar-upload-mask {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: rgb(0 0 0 / 45%);
    color: #fff;
    opacity: 0;
    transition: opacity 0.2s;
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
