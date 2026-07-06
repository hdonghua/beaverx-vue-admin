<template>
  <PageContainer>
    <a-card class="general-card" title="LoadingLayer 加载层">
      <DemoSection
        title="局部遮罩"
        description="通过 ref 调用 show() / close()。默认在父容器 position: relative 区域内覆盖。"
      >
        <div class="layer-box">
          <p>这是被遮罩覆盖的内容区域</p>
          <a-button type="primary" @click="showLocal">显示加载</a-button>
          <LoadingLayer ref="localLayerRef" text="加载中..." />
        </div>
        <template #code>
&lt;div class="layer-box"&gt;
  &lt;LoadingLayer ref="layerRef" text="加载中..." /&gt;
&lt;/div&gt;

layerRef.value?.show();
layerRef.value?.close();
        </template>
      </DemoSection>

      <DemoSection title="全屏遮罩" description="fullscreen 为 true 时覆盖整个视口。">
        <a-button @click="showFullscreen">全屏加载 2 秒</a-button>
        <LoadingLayer ref="fullscreenLayerRef" fullscreen text="请稍候..." />
      </DemoSection>
    </a-card>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import PageContainer from '@/components/page-container/index.vue';
  import LoadingLayer from '@/components/common/LoadingLayer.vue';
  import DemoSection from '../_demo/demo-section.vue';

  const localLayerRef = ref<InstanceType<typeof LoadingLayer>>();
  const fullscreenLayerRef = ref<InstanceType<typeof LoadingLayer>>();

  function showLocal() {
    localLayerRef.value?.show();
    window.setTimeout(() => localLayerRef.value?.close(), 1500);
  }

  function showFullscreen() {
    fullscreenLayerRef.value?.show();
    window.setTimeout(() => fullscreenLayerRef.value?.close(), 2000);
  }
</script>

<style scoped lang="less">
  .layer-box {
    position: relative;
    min-height: 160px;
    padding: 24px;
    border: 1px dashed var(--color-border-2);
    border-radius: var(--border-radius-small);
    background: var(--color-fill-1);
  }
</style>
