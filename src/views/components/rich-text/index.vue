<template>
  <PageContainer :breadcrumb="['menu.components', 'menu.components.richText']">
    <a-card class="general-card" title="RichText 富文本">
      <DemoSection
        title="双向绑定"
        description="v-model:value 绑定 HTML 字符串。disabled 为 true 时只读。"
      >
        <RichText v-model:value="content" placeholder="请输入正文..." />
        <a-divider />
        <div class="preview-title">HTML 输出</div>
        <pre class="html-preview">{{ content }}</pre>
        <template #code>
&lt;RichText v-model:value="content" placeholder="请输入正文..." /&gt;
        </template>
      </DemoSection>
    </a-card>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import PageContainer from '@/components/page-container/index.vue';
  import RichText from '@/components/common/RichText.vue';
  import DemoSection from '../_demo/demo-section.vue';

  const content = ref('<p>这是一段 <strong>富文本</strong> 示例内容。</p>');
</script>

<style scoped lang="less">
  .preview-title {
    margin-bottom: 8px;
    color: var(--color-text-2);
    font-size: 13px;
  }

  .html-preview {
    margin: 0;
    padding: 12px;
    background: var(--color-fill-2);
    border-radius: var(--border-radius-small);
    font-size: 12px;
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>
