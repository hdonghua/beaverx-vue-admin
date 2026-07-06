<template>
  <div class="login-form-wrapper">
    <div class="login-form-title">后台登录</div>
    <div class="login-form-sub-title">请保管好您的账号密码</div>
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
          placeholder="请输入密码"
          allow-clear
        >
          <template #prefix>
            <icon-lock />
          </template>
        </a-input-password>
      </a-form-item>
      <a-button type="primary" html-type="submit" long :loading="loading">
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
  .login-form {
    &-wrapper {
      width: 320px;
    }

    &-title {
      color: var(--color-text-1);
      font-weight: 500;
      font-size: 24px;
      line-height: 32px;
    }

    &-sub-title {
      color: var(--color-text-3);
      font-size: 16px;
      line-height: 24px;
    }

    &-error-msg {
      height: 32px;
      color: rgb(var(--red-6));
      line-height: 32px;
    }
  }
</style>
