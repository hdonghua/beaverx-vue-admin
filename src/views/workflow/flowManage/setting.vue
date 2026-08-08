<template>
  <section class="fd-setting-box">
    <div class="setting-main-panel">
      <a-form :model="flowDef" :auto-label-width="true" :style="{ width: '600px' }">
        <div class="setting-name">提交人权限</div>
        <a-form-item
          field="cancelable"
          tooltip="第一个审批节点通过后，提交人仍可撤销申请（配置前已发起的申请不生效）"
          label="允许撤销审批中的申请">
          <a-switch v-model="flowDef.cancelable" type="round" :checked-value="1" :unchecked-value="0" />
        </a-form-item>
        <a-form-item> <div style="clear: both"></div></a-form-item>
      </a-form>
    </div>
  </section>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { useFlowStore } from "@/store/index";
import { onMounted, ref } from "vue";

/** 流程定义工作流对象 */
interface WorkFlowDef {
  cancelable: number;
  [key: string]: any;
}

let { flowDefinition, setFlowDef } = useFlowStore();
let flowDef = ref<WorkFlowDef>({ cancelable: 0 });

onMounted(() => {
  (flowDef.value as any) = flowDefinition.workFlowDef;
});
</script>

<style lang="less" scoped>
.fd-setting-box {
  padding: 15px 0 10px;
  display: flex;
  justify-content: center;
  overflow-y: auto;
  height: 100%;

  .setting-main-panel {
    background-color: var(--color-bg-2);
    width: 600px;
    border-radius: var(--border-radius-large);
    display: flex;
    justify-content: center;
    padding: 24px 40px 0;
    height: 100%;
    overflow: hidden;
    overflow-y: auto;

    .setting-name {
      width: 94px;
      color: var(--color-text-1);
      font-size: 14px;
      font-weight: 550;
      line-height: 22px;
      flex-shrink: 0;
      flex-grow: 0;
      margin-bottom: 10px;
    }
  }
}
</style>
