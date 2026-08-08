<template>
  <div class="login-form-wrapper">
    <div class="login-form-title">Hi，欢迎登录</div>
    <div class="login-form-sub-title">请输入账号密码以继续使用系统</div>
    <div class="login-form-error-msg">{{ errorMessage }}</div>
    <a-form
      ref="loginForm"
      :model="userInfo"
      class="login-form"
      layout="vertical"
      @submit="handleSubmit"
    >
      <a-form-item
        field="userName"
        :rules="[{ required: true, message: '用户名不能为空' }]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input
          v-model="userInfo.userName"
          size="large"
          placeholder="请输入用户名"
        >
          <template #prefix>
            <icon-user />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item
        field="password"
        :rules="[{ required: true, message: '密码不能为空' }]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input-password
          v-model="userInfo.password"
          size="large"
          placeholder="请输入密码"
          allow-clear
        >
          <template #prefix>
            <icon-lock />
          </template>
        </a-input-password>
      </a-form-item>
      <a-button
        class="login-submit"
        type="primary"
        html-type="submit"
        size="large"
        long
        :loading="loading"
      >
        登录
      </a-button>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { Message } from '@arco-design/web-vue';
  import { ValidatedError } from '@arco-design/web-vue/es/form/interface';
  import { useUserStore, useTabBarStore } from '@/store';
  import useLoading from '@/hooks/loading';
  import { LoginRequest } from '@/api/server/auth';

  const router = useRouter();
  const errorMessage = ref('');
  const { loading, setLoading } = useLoading();
  const userStore = useUserStore();
  const tabBarStore = useTabBarStore();

  const userInfo = reactive({
    userName: '',
    password: '',
  });

  const handleSubmit = async ({
    errors,
    values,
  }: {
    errors: Record<string, ValidatedError> | undefined;
    values: Record<string, any>;
  }) => {
    if (loading.value) return;
    if (!errors) {
      setLoading(true);
      try {
        await userStore.login(values as LoginRequest);
        tabBarStore.resetTabList();
        const { redirect, ...othersQuery } = router.currentRoute.value.query;
        const redirectTarget = (redirect as string) || '';
        if (redirectTarget.startsWith('/')) {
          await router.replace({
            path: redirectTarget,
            query: othersQuery,
          });
        } else {
          await router.replace({
            name: redirectTarget || 'Home',
            query: othersQuery,
          });
        }
        Message.success('欢迎使用');
      } catch (err) {
        errorMessage.value = (err as Error).message;
      } finally {
        setLoading(false);
      }
    }
  };
</script>

<style lang="less" scoped>
  .login-form-wrapper {
    width: min(100%, 360px);
    animation: form-in 0.55s ease both;
  }

  .login-form-title {
    color: var(--color-text-1);
    font-weight: 700;
    font-size: 30px;
    line-height: 1.25;
    letter-spacing: 0.01em;
  }

  .login-form-sub-title {
    margin-top: 10px;
    color: var(--color-text-3);
    font-size: 15px;
    line-height: 1.6;
  }

  .login-form-error-msg {
    min-height: 28px;
    margin-top: 8px;
    color: rgb(var(--red-6));
    font-size: 13px;
    line-height: 28px;
  }

  .login-form {
    :deep(.arco-form-item) {
      margin-bottom: 20px;
    }

    :deep(.arco-input-wrapper),
    :deep(.arco-input-password) {
      background: var(--color-fill-2);
    }

    :deep(.arco-input-wrapper:hover),
    :deep(.arco-input-password:hover),
    :deep(.arco-input-wrapper.arco-input-focus),
    :deep(.arco-input-password.arco-input-focus) {
      background: var(--color-bg-2);
    }
  }

  .login-submit {
    margin-top: 8px;
    height: 44px;
    font-size: 16px;
    font-weight: 600;
  }

  @keyframes form-in {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
