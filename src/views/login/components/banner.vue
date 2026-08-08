<template>
  <div class="banner">
    <a-carousel
      class="carousel"
      animation-name="fade"
      indicator-type="dot"
      show-arrow="never"
      :auto-play="{ interval: 2000 }"
      :move-speed="600"
    >
      <a-carousel-item v-for="item in carouselItem" :key="item.slogan">
        <div class="carousel-item">
          <div class="carousel-visual">
            <img class="carousel-image" :src="item.image" alt="" />
          </div>
          <div class="carousel-copy">
            <div class="carousel-title">{{ item.slogan }}</div>
            <div class="carousel-sub-title">{{ item.subSlogan }}</div>
          </div>
        </div>
      </a-carousel-item>
    </a-carousel>
  </div>
</template>

<script lang="ts" setup>
  import illust1 from '@/assets/images/login-illust-1.svg?url';
  import illust2 from '@/assets/images/login-illust-2.svg?url';
  import illust3 from '@/assets/images/login-illust-3.svg?url';

  const carouselItem = [
    {
      slogan: '一站式企业数字化管理平台',
      subSlogan: '统一权限、流程与数据，打破信息孤岛，助力团队高效协同',
      image: illust1,
    },
    {
      slogan: '安全可靠的企业级架构',
      subSlogan: '细粒度权限管控、全链路审计日志，满足合规与内控标准',
      image: illust2,
    },
    {
      slogan: '快速部署，灵活扩展',
      subSlogan: '模块化产品设计，按需组合功能，显著缩短交付与上线周期',
      image: illust3,
    },
  ];
</script>

<style lang="less" scoped>
  .banner {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    padding: 96px 48px 48px;
    box-sizing: border-box;
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
      bottom: 8px;
      height: auto;
      background: none;
    }

    :deep(.arco-carousel-indicator-item) {
      width: 8px;
      height: 8px;
      background: rgba(22, 93, 255, 0.22);
    }

    :deep(.arco-carousel-indicator-item-active) {
      width: 22px;
      border-radius: 999px;
      background: rgb(var(--primary-6));
    }
  }

  .carousel-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 28px;
    padding: 0 12px 40px;
    box-sizing: border-box;
  }

  .carousel-visual {
    display: flex;
    align-items: center;
    justify-content: center;
    width: min(100%, 460px);
    animation: float-illust 5.5s ease-in-out infinite;
  }

  .carousel-image {
    width: 100%;
    max-height: min(46vh, 320px);
    object-fit: contain;
    user-select: none;
    pointer-events: none;
  }

  .carousel-copy {
    max-width: 420px;
    text-align: center;
  }

  .carousel-title {
    color: var(--color-text-1);
    font-weight: 650;
    font-size: 24px;
    line-height: 1.4;
    letter-spacing: 0.01em;
  }

  .carousel-sub-title {
    margin-top: 10px;
    color: var(--color-text-3);
    font-size: 15px;
    line-height: 1.7;
  }

  @keyframes float-illust {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  body[arco-theme='dark'] {
    .carousel {
      :deep(.arco-carousel-indicator-item) {
        background: rgba(255, 255, 255, 0.22);
      }
    }
  }
</style>
