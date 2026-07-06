<template>
  <PageContainer>
    <a-card class="general-card" title="EditableText 可编辑文本">
      <DemoSection
        title="点击编辑"
        description="点击文本进入编辑，失焦后触发 change 事件。hoverable 为 true 时悬停显示编辑图标。"
      >
        <EditableText :value="text" @change="handleChange" />
        <div class="value-tip">当前值：{{ text }}</div>
        <template #code>
&lt;EditableText :value="text" @change="onChange" /&gt;
        </template>
      </DemoSection>

      <DemoSection title="悬停显示编辑图标">
        <EditableText :value="hoverText" hoverable @change="handleHoverChange" />
        <div class="value-tip">当前值：{{ hoverText }}</div>
        <template #code>
&lt;EditableText v-model:value="text" hoverable @change="onChange" /&gt;
        </template>
      </DemoSection>
    </a-card>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import PageContainer from '@/components/page-container/index.vue';
  import EditableText from '@/components/common/EditableText.vue';
  import DemoSection from '../_demo/demo-section.vue';

  const text = ref('点击我可以编辑');
  const hoverText = ref('悬停后显示编辑图标');

  function handleChange(value: string) {
    text.value = value;
    Message.success(`已更新为：${value}`);
  }

  function handleHoverChange(value: string) {
    hoverText.value = value;
  }
</script>

<style scoped lang="less">
  .value-tip {
    margin-top: 12px;
    color: var(--color-text-3);
    font-size: 13px;
  }
</style>
