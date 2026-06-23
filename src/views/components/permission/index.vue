<template>
  <PageContainer :breadcrumb="['menu.components', 'menu.components.permission']">
    <a-card class="general-card" title="权限指令 v-permission">
      <DemoSection
        title="指令说明"
        description="v-permission 根据当前登录用户的权限码控制元素是否渲染。无权限时元素会从 DOM 中移除（非 disabled）。权限码需与后端 RbacPermissionCodes 及 src/constants/permissions.ts 保持一致。"
      >
        <a-alert type="info">
          当前账号权限码数量：{{ permissionCount }}。
          超级管理员（super_admin）拥有全部权限。
        </a-alert>
      </DemoSection>

      <DemoSection
        title="v-permission 指令"
        description="传入单个权限码字符串，或权限码数组（默认满足任一即显示）。"
      >
        <a-space wrap>
          <a-button
            type="primary"
            v-permission="[Permissions.System.User.List]"
          >
            有权限：用户列表
          </a-button>
          <a-button
            type="outline"
            v-permission="[Permissions.System.User.Create]"
          >
            有权限：用户新增
          </a-button>
          <a-button
            status="danger"
            v-permission="['demo:permission:not_exists']"
          >
            无权限（不应显示）
          </a-button>
        </a-space>
        <template #code>
&lt;!-- 推荐：使用 Permissions 常量，避免硬编码 --&gt;
&lt;a-button v-permission="[Permissions.System.User.List]"&gt;
  用户列表
&lt;/a-button&gt;

&lt;a-button v-permission="[Permissions.System.User.Create]"&gt;
  新增用户
&lt;/a-button&gt;

&lt;!-- 也可直接写权限码字符串 --&gt;
&lt;a-button v-permission="['system:user:delete']"&gt;删除&lt;/a-button&gt;
        </template>
      </DemoSection>

      <DemoSection
        title="脚本内校验 usePermission"
        description="在 setup 逻辑中无法使用指令时，可调用 hasPermission / hasAllPermissions。"
      >
        <a-space>
          <a-tag :color="canListUser ? 'green' : 'red'">
            用户列表：{{ canListUser ? '有权限' : '无权限' }}
          </a-tag>
          <a-tag :color="canFakePermission ? 'green' : 'red'">
            演示权限：{{ canFakePermission ? '有权限' : '无权限' }}
          </a-tag>
        </a-space>
        <template #code>
import usePermission from '@/hooks/permission';
import { Permissions } from '@/constants/permissions';

const { hasPermission, hasAllPermissions } = usePermission();

if (hasPermission(Permissions.System.User.List)) {
  // ...
}

// 需同时拥有多个权限
if (hasAllPermissions([
  Permissions.System.User.Update,
  Permissions.System.User.ResetPassword,
])) {
  // ...
}
        </template>
      </DemoSection>

      <DemoSection
        title="工具函数 hasPermission"
        description="在非组件上下文（如工具模块）可直接导入 @/utils/permission-check。"
      >
        <a-button
          :disabled="!canDeleteUser"
          @click="Message.info('具备删除用户权限')"
        >
          {{ canDeleteUser ? '可执行删除操作' : '无删除用户权限' }}
        </a-button>
        <template #code>
import { hasPermission } from '@/utils/permission-check';
import { Permissions } from '@/constants/permissions';

const allowed = hasPermission(Permissions.System.User.Delete);
        </template>
      </DemoSection>

      <DemoSection title="当前账号权限码" description="登录后从 /api/auth/profile 写入 userStore.permissions。">
        <a-textarea
          :model-value="permissionText"
          :auto-size="{ minRows: 4, maxRows: 12 }"
          readonly
        />
      </DemoSection>
    </a-card>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import PageContainer from '@/components/page-container/index.vue';
  import usePermission from '@/hooks/permission';
  import { Permissions } from '@/constants/permissions';
  import useUserStore from '@/store/modules/user';
  import DemoSection from '../_demo/demo-section.vue';

  const userStore = useUserStore();
  const { hasPermission } = usePermission();

  const permissionCount = computed(() => userStore.permissions?.length ?? 0);
  const permissionText = computed(() =>
    (userStore.permissions || []).join('\n') || '（暂无）'
  );

  const canListUser = computed(() =>
    hasPermission(Permissions.System.User.List)
  );
  const canDeleteUser = computed(() =>
    hasPermission(Permissions.System.User.Delete)
  );
  const canFakePermission = computed(() =>
    hasPermission('demo:permission:not_exists')
  );
</script>
