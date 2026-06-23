<template>
  <PageContainer :breadcrumb="['menu.components', 'menu.components.rollLoading']">
    <a-card class="general-card" title="RollLoading 滚动加载">
      <DemoSection
        title="触底加载更多"
        description="将 RollLoading 放在列表底部，进入视口时触发 onScroll。hasMore 为 false 时停止监听。"
      >
        <div class="list-box">
          <div v-for="item in items" :key="item" class="list-item">列表项 {{ item }}</div>
          <RollLoading :has-more="hasMore" @on-scroll="loadMore">
            <a-spin v-if="loading" tip="加载中..." />
            <span v-else-if="!hasMore" class="no-more">没有更多了</span>
          </RollLoading>
        </div>
        <template #code>
&lt;RollLoading :has-more="hasMore" @on-scroll="loadMore"&gt;
  &lt;a-spin v-if="loading" /&gt;
&lt;/RollLoading&gt;
        </template>
      </DemoSection>
    </a-card>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import PageContainer from '@/components/page-container/index.vue';
  import RollLoading from '@/components/common/RollLoading.vue';
  import DemoSection from '../_demo/demo-section.vue';

  const items = ref(Array.from({ length: 8 }, (_, i) => i + 1));
  const loading = ref(false);
  const hasMore = ref(true);
  const page = ref(1);

  function loadMore() {
    if (loading.value || !hasMore.value) {
      return;
    }
    loading.value = true;
    window.setTimeout(() => {
      page.value += 1;
      const start = items.value.length + 1;
      items.value.push(...Array.from({ length: 5 }, (_, i) => start + i));
      loading.value = false;
      if (page.value >= 4) {
        hasMore.value = false;
      }
    }, 800);
  }
</script>

<style scoped lang="less">
  .list-box {
    height: 320px;
    overflow-y: auto;
    border: 1px solid var(--color-border-2);
    border-radius: var(--border-radius-small);
    padding: 8px 12px;
  }

  .list-item {
    padding: 10px 12px;
    margin-bottom: 8px;
    background: var(--color-fill-2);
    border-radius: var(--border-radius-small);
  }

  .no-more {
    color: var(--color-text-3);
    font-size: 13px;
  }
</style>
