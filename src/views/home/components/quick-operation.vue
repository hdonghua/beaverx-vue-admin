<template>
  <a-card
    class="general-card"
    title="快捷操作"
    :header-style="{ paddingBottom: '0' }"
    :body-style="{ padding: '24px 20px 20px 20px' }"
  >
    <a-empty v-if="!visibleLinks.length" description="暂无可用入口" />
    <a-row v-else :gutter="8">
      <a-col
        v-for="link in visibleLinks"
        :key="link.path"
        :span="8"
        class="wrapper"
        @click="go(link.path)"
      >
        <div class="icon">
          <component :is="link.icon" />
        </div>
        <a-typography-paragraph class="text">
          {{ link.text }}
        </a-typography-paragraph>
      </a-col>
    </a-row>
  </a-card>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { Permissions } from '@/constants/permissions';
  import { hasPermission } from '@/utils/permission-check';

  const router = useRouter();

  const links = [
    {
      text: '发起审批',
      icon: 'icon-plus-circle',
      path: '/approval/flowstart',
      permission: Permissions.Oa.Approval,
    },
    {
      text: '待办审批',
      icon: 'icon-check-circle',
      path: '/approval/pending',
      permission: Permissions.Oa.Approval,
    },
    {
      text: '我的申请',
      icon: 'icon-file',
      path: '/approval/my',
      permission: Permissions.Oa.Approval,
    },
    {
      text: '工单处理',
      icon: 'icon-customer-service',
      path: '/ticket/process',
      permission: Permissions.Ticket.Work.Process,
    },
    {
      text: '在线用户',
      icon: 'icon-user-group',
      path: '/system/online-user',
      permission: Permissions.System.OnlineUser.List,
    },
    {
      text: '用户管理',
      icon: 'icon-user',
      path: '/system/user',
      permission: Permissions.System.User.List,
    },
    {
      text: '支付订单',
      icon: 'icon-storage',
      path: '/payment/order',
      permission: Permissions.Payment.Order.List,
    },
    {
      text: '流程管理',
      icon: 'icon-branch',
      path: '/workflow/flowManage',
      permission: Permissions.Oa.WorkflowManage,
    },
  ];

  const visibleLinks = computed(() =>
    links.filter((item) => hasPermission(item.permission)).slice(0, 6)
  );

  const go = (path: string) => {
    router.push(path);
  };
</script>

<style scoped lang="less"></style>
