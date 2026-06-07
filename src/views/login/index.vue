<template>
  <div class="login-page">
    <div class="logo">
      <img
        alt="logo"
        src="//p3-armor.byteimg.com/tos-cn-i-49unhts6dw/dfdba5317c0c20ce20e64fac803d52bc.svg~tplv-49unhts6dw-image.image"
      />
      <div class="logo-text">{{ appStore.systemName }}</div>
    </div>
    <aside class="banner-side">
      <LoginBanner />
    </aside>
    <main class="main-side">
      <div class="main-body">
        <LoginForm />
      </div>
      <Footer v-if="appStore.loginFooter" class="main-footer" />
    </main>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, onUnmounted } from 'vue';
  import { useAppStore } from '@/store';
  import Footer from '@/components/footer/index.vue';
  import LoginBanner from './components/banner.vue';
  import LoginForm from './components/login-form.vue';

  const appStore = useAppStore();

  onMounted(() => {
    document.documentElement.classList.add('is-login-page');
  });

  onUnmounted(() => {
    document.documentElement.classList.remove('is-login-page');
  });
</script>

<style lang="less">
  html.is-login-page,
  html.is-login-page body,
  html.is-login-page #app {
    height: 100%;
    overflow: hidden;
  }
</style>

<style lang="less" scoped>
  .login-page {
    display: grid;
    grid-template-columns: 550px minmax(0, 1fr);
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: var(--color-bg-1);
  }

  .banner-side {
    height: 100%;
    min-height: 0;
    background: linear-gradient(163.85deg, #1d2129 0%, #00308f 100%);
  }

  .main-side {
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: 100%;
    min-height: 0;
    background-color: var(--color-bg-1);
  }

  .main-body {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-height: 0;
  }

  .main-footer {
    flex-shrink: 0;
  }

  .logo {
    position: fixed;
    top: 24px;
    left: 22px;
    z-index: 10;
    display: inline-flex;
    align-items: center;

    &-text {
      margin-left: 4px;
      color: var(--color-fill-1);
      font-size: 20px;
    }
  }

  @media (max-width: @screen-lg) {
    .login-page {
      grid-template-columns: minmax(280px, 36%) minmax(0, 1fr);
    }
  }
</style>
