<template>
  <PageContainer>
    <a-card class="general-card" title="DictTag 字典标签">
      <DemoSection
        title="标签模式"
        description="根据字典值自动匹配 label 与 listClass 颜色。fallback 在无匹配时显示。"
      >
        <a-space wrap>
          <DictTag type-code="sys_menu_type" value="0" />
          <DictTag type-code="sys_menu_type" value="1" />
          <DictTag type-code="sys_menu_type" value="2" />
          <DictTag type-code="work_ticket_status" value="0" />
          <DictTag type-code="work_ticket_status" value="2" />
        </a-space>
        <template #code>
&lt;DictTag type-code="sys_menu_type" value="0" /&gt;
&lt;DictTag type-code="work_ticket_status" value="2" /&gt;
        </template>
      </DemoSection>

      <DemoSection
        title="纯文本模式"
        description="plain 为 true 时不渲染 Tag，仅输出字典文本，适合表格内联展示。"
      >
        <DictTag type-code="sys_menu_type" value="1" plain />
        <template #code>
&lt;DictTag type-code="sys_menu_type" value="1" plain /&gt;
        </template>
      </DemoSection>
    </a-card>
  </PageContainer>
</template>

<script lang="ts" setup>
  import PageContainer from '@/components/page-container/index.vue';
  import DictTag from '@/components/dict-tag/index.vue';
  import DemoSection from '../_demo/demo-section.vue';
</script>
