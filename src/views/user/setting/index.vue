<template>
  <PageContainer :breadcrumb="['menu.user', 'menu.user.center']">
    <a-card class="center-card" :bordered="false">
      <UserPanel ref="userPanelRef" />
      <a-divider :margin="24" />
      <a-tabs default-active-key="basic" type="rounded" class="center-tabs">
        <a-tab-pane key="basic" :title="$t('userSetting.tab.basicInformation')">
          <BasicInformation @saved="handleProfileSaved" />
        </a-tab-pane>
        <a-tab-pane key="password" :title="$t('userSetting.tab.changePassword')">
          <ChangePassword />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import UserPanel from './components/user-panel.vue';
  import BasicInformation from './components/basic-information.vue';
  import ChangePassword from './components/change-password.vue';

  const userPanelRef = ref<InstanceType<typeof UserPanel>>();

  const handleProfileSaved = () => {
    userPanelRef.value?.loadProfile();
  };
</script>

<script lang="ts">
  export default {
    name: 'UserCenter',
  };
</script>

<style scoped lang="less">
  .center-card {
    border-radius: 4px;

    :deep(.arco-card-body) {
      padding: 20px;
    }
  }

  .center-tabs {
    :deep(.arco-tabs-content) {
      padding-top: 8px;
    }
  }
</style>
