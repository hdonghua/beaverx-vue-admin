<template>
  <PageContainer>
    <a-card class="general-card" title="SvgIcon 图标">
      <DemoSection
        title="本地 SVG 图标"
        description="iconClass 对应 src/icons/svg 下的文件名（不含 .svg）。图标通过 vite-plugin-svg-icons 注册为雪碧图。"
      >
        <a-space wrap :size="24" class="icon-list">
          <div v-for="icon in icons" :key="icon" class="icon-item">
            <svg-icon :icon-class="icon" class="icon-preview" />
            <span class="icon-name">{{ icon }}</span>
          </div>
        </a-space>
        <template #code>
&lt;svg-icon icon-class="approval" /&gt;
&lt;svg-icon icon-class="copy" color="#165DFF" class="custom-size" /&gt;
        </template>
      </DemoSection>

      <DemoSection title="自定义颜色与尺寸" description="通过 color 设置填充色，通过 class 控制大小。">
        <a-space :size="32">
          <svg-icon icon-class="approval" class="icon-lg" />
          <svg-icon icon-class="approval" color="#165DFF" class="icon-lg" />
          <svg-icon icon-class="reject" color="#F53F3F" class="icon-lg" />
        </a-space>
      </DemoSection>
    </a-card>
  </PageContainer>
</template>

<script lang="ts" setup>
  import PageContainer from '@/components/page-container/index.vue';
  import SvgIcon from '@/components/svg-icon/index.vue';
  import DemoSection from '../_demo/demo-section.vue';

  const icons = [
    'approval',
    'reject',
    'copy',
    'collapse',
    'underway',
    'menu-flow',
    'widget-mobile',
    'widget-rich-text',
  ];
</script>

<style scoped lang="less">
  .icon-list {
    padding: 8px 0;
  }

  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 88px;
  }

  .icon-preview {
    font-size: 28px;
    color: var(--color-text-1);
  }

  .icon-name {
    font-size: 12px;
    color: var(--color-text-3);
    text-align: center;
    word-break: break-all;
  }

  .icon-lg {
    font-size: 36px;
  }
</style>
