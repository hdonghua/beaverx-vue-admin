<template>
  <section class="demo-section">
    <div class="demo-section__header">
      <h3 class="demo-section__title">{{ title }}</h3>
      <p v-if="description" class="demo-section__desc">{{ description }}</p>
    </div>
    <a-card class="demo-section__preview" :title="previewTitle || '效果展示'">
      <slot />
    </a-card>
    <a-card v-if="$slots.code" class="demo-section__code" title="使用示例">
      <pre class="demo-section__pre"><code><slot name="code" /></code></pre>
    </a-card>
  </section>
</template>

<script lang="ts" setup>
  defineProps<{
    title: string;
    description?: string;
    previewTitle?: string;
  }>();
</script>

<style scoped lang="less">
  .demo-section {
    & + & {
      margin-top: 24px;
    }

    &__title {
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-1);
    }

    &__desc {
      margin: 0 0 12px;
      color: var(--color-text-3);
      line-height: 1.6;
    }

    &__preview,
    &__code {
      margin-top: 12px;
    }

    &__pre {
      margin: 0;
      padding: 12px 16px;
      background: var(--color-fill-2);
      border-radius: var(--border-radius-small);
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.6;
      color: var(--color-text-2);
    }
  }
</style>
