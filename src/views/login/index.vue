<template>
  <div class="login-page">
    <aside class="banner-side">
      <div class="banner-glow banner-glow--a" />
      <div class="banner-glow banner-glow--b" />
      <div class="banner-glow banner-glow--c" />
      <div class="logo">
        <img alt="logo" class="logo-image" :src="Logo" />
        <div class="logo-text">{{ appStore.systemName }}</div>
      </div>
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
  import Logo from '@/assets/images/beaverx-admin-logo.png';

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
    grid-template-columns: 1fr 1fr;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: var(--color-bg-1);
  }

  .banner-side {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    background:
      radial-gradient(120% 80% at 12% 18%, rgba(22, 93, 255, 0.12), transparent 55%),
      radial-gradient(90% 70% at 88% 72%, rgba(15, 198, 194, 0.1), transparent 50%),
      linear-gradient(165deg, #f7faff 0%, #eef4ff 48%, #f5f8fc 100%);
  }

  .banner-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(48px);
    pointer-events: none;
    animation: float-glow 10s ease-in-out infinite;

    &--a {
      top: 8%;
      left: 10%;
      width: 220px;
      height: 220px;
      background: rgba(22, 93, 255, 0.18);
    }

    &--b {
      right: 6%;
      bottom: 18%;
      width: 260px;
      height: 260px;
      background: rgba(15, 198, 194, 0.14);
      animation-delay: -3s;
    }

    &--c {
      left: 42%;
      top: 42%;
      width: 160px;
      height: 160px;
      background: rgba(255, 143, 61, 0.1);
      animation-delay: -6s;
    }
  }

  .logo {
    position: absolute;
    top: 28px;
    left: 36px;
    z-index: 4;
    display: inline-flex;
    align-items: center;
    gap: 10px;

    &-image {
      width: 34px;
      height: 34px;
      object-fit: contain;
      flex-shrink: 0;
    }

    &-text {
      color: var(--color-text-1);
      font-size: 22px;
      font-weight: 650;
      letter-spacing: 0.02em;
      line-height: 1;
    }
  }

  .main-side {
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: 100%;
    min-height: 0;
    background: var(--color-bg-1);
    border-left: 1px solid var(--color-border-1);
  }

  .main-body {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-height: 0;
    padding: 40px 24px;
  }

  .main-footer {
    flex-shrink: 0;
  }

  @keyframes float-glow {
    0%,
    100% {
      transform: translate3d(0, 0, 0) scale(1);
    }
    50% {
      transform: translate3d(12px, -16px, 0) scale(1.06);
    }
  }

  body[arco-theme='dark'] {
    .banner-side {
      background:
        radial-gradient(120% 80% at 12% 18%, rgba(22, 93, 255, 0.22), transparent 55%),
        radial-gradient(90% 70% at 88% 72%, rgba(15, 198, 194, 0.14), transparent 50%),
        linear-gradient(165deg, #1a1d24 0%, #171b26 48%, #151820 100%);
    }

    .banner-glow--a {
      background: rgba(22, 93, 255, 0.28);
    }

    .banner-glow--b {
      background: rgba(15, 198, 194, 0.18);
    }

    .main-side {
      border-left-color: var(--color-border-2);
    }
  }

  @media (max-width: @screen-md) {
    .login-page {
      grid-template-columns: 1fr;
    }

    .banner-side {
      display: none;
    }

    .main-side {
      border-left: 0;
    }
  }
</style>
