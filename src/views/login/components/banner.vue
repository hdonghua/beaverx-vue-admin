<template>
  <div class="banner">
    <a-carousel
      class="carousel"
      animation-name="fade"
      indicator-type="dot"
      show-arrow="always"
    >
      <a-carousel-item v-for="item in carouselItem" :key="item.slogan">
        <div class="carousel-item">
          <div class="carousel-title">{{ item.slogan }}</div>
          <div class="carousel-sub-title">{{ item.subSlogan }}</div>
          <img class="carousel-image" :src="item.image" alt="" />
        </div>
      </a-carousel-item>
    </a-carousel>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import bannerImage from '@/assets/images/login-banner.png';

  const { t } = useI18n();
  const carouselItem = computed(() => [
    {
      slogan: t('login.banner.slogan1'),
      subSlogan: t('login.banner.subSlogan1'),
      image: bannerImage,
    },
    {
      slogan: t('login.banner.slogan2'),
      subSlogan: t('login.banner.subSlogan2'),
      image: bannerImage,
    },
    {
      slogan: t('login.banner.slogan3'),
      subSlogan: t('login.banner.subSlogan3'),
      image: bannerImage,
    },
  ]);
</script>

<style lang="less" scoped>
  .banner {
    width: 100%;
    height: 100%;
  }

  .carousel {
    width: 100%;
    height: 100%;

    :deep(.arco-carousel),
    :deep(.arco-carousel-slide),
    :deep(.arco-carousel-item) {
      height: 100%;
    }

    :deep(.arco-carousel-indicator-wrapper-bottom) {
      bottom: 72px;
      height: auto;
      background: none;
    }

    :deep(.arco-carousel-indicator-bottom) {
      bottom: 0;
    }

    :deep(.arco-carousel-arrow) {
      z-index: 3;
    }

    :deep(.arco-carousel-arrow > div) {
      top: auto;
      bottom: 64px;
      transform: none;
    }

    :deep(.arco-carousel-arrow-left) {
      left: 24px;
      right: auto;
    }

    :deep(.arco-carousel-arrow-right) {
      right: 24px;
      left: auto;
    }
  }

  .carousel-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 72px 40px 120px;
    box-sizing: border-box;
  }

  .carousel-title {
    color: var(--color-fill-1);
    font-weight: 500;
    font-size: 20px;
    line-height: 28px;
    text-align: center;
  }

  .carousel-sub-title {
    margin-top: 8px;
    color: var(--color-text-3);
    font-size: 14px;
    line-height: 22px;
    text-align: center;
  }

  .carousel-image {
    width: 320px;
    max-width: 100%;
    max-height: calc(100% - 220px);
    margin-top: 24px;
    object-fit: contain;
  }
</style>
