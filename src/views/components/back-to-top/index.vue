<template>
  <PageContainer>
    <a-card class="general-card" title="BackToTop 回到顶部">
      <DemoSection
        title="容器内回到顶部"
        description="targetContainer 传入可滚动容器的 CSS 选择器。向下滚动后右下角出现按钮。"
      >
        <div id="back-to-top-demo" class="scroll-box">
          <p v-for="i in 30" :key="i" class="scroll-line">滚动内容行 {{ i }}</p>
        </div>
        <BackToTop target-container="#back-to-top-demo" />
        <template #code>
&lt;div id="scroll-area" class="scroll-box"&gt;...&lt;/div&gt;
&lt;BackToTop target-container="#scroll-area" /&gt;
        </template>
      </DemoSection>
    </a-card>
  </PageContainer>
</template>

<script lang="ts" setup>
  import PageContainer from '@/components/page-container/index.vue';
  import BackToTop from '@/components/common/BackToTop.vue';
  import DemoSection from '../_demo/demo-section.vue';
</script>

<style scoped lang="less">
  .scroll-box {
    height: 280px;
    overflow-y: auto;
    padding: 12px 16px;
    border: 1px solid var(--color-border-2);
    border-radius: var(--border-radius-small);
    background: var(--color-fill-1);
  }

  .scroll-line {
    margin: 0 0 12px;
    color: var(--color-text-2);
  }
</style>
