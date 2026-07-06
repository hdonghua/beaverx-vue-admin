<template>
  <PageContainer>
    <a-card class="general-card" title="DictSelect 字典选择">
      <DemoSection
        title="基础用法"
        description="传入 typeCode 自动请求字典数据。valueType 为 number 时选项值为数字（适合状态枚举）。"
      >
        <a-space direction="vertical" fill>
          <a-form-item label="菜单类型（字符串值）">
            <DictSelect
              v-model="menuType"
              type-code="sys_menu_type"
              allow-clear
              placeholder="请选择菜单类型"
              style="width: 240px"
            />
          </a-form-item>
          <div class="value-tip">当前值：{{ menuType ?? '未选择' }}</div>

          <a-form-item label="工单状态（数字值）">
            <DictSelect
              v-model="ticketStatus"
              type-code="work_ticket_status"
              value-type="number"
              allow-clear
              placeholder="请选择工单状态"
              style="width: 240px"
            />
          </a-form-item>
          <div class="value-tip">当前值：{{ ticketStatus ?? '未选择' }}</div>
        </a-space>
        <template #code>
&lt;DictSelect
  v-model="menuType"
  type-code="sys_menu_type"
  allow-clear
  placeholder="请选择菜单类型"
/&gt;

&lt;DictSelect
  v-model="status"
  type-code="work_ticket_status"
  value-type="number"
  allow-clear
/&gt;
        </template>
      </DemoSection>
    </a-card>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import PageContainer from '@/components/page-container/index.vue';
  import DictSelect from '@/components/dict-select/index.vue';
  import DemoSection from '../_demo/demo-section.vue';

  const menuType = ref<string>();
  const ticketStatus = ref<number>();
</script>

<style scoped lang="less">
  .value-tip {
    color: var(--color-text-3);
    font-size: 13px;
  }
</style>
