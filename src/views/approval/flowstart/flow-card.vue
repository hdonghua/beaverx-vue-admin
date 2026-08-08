<template>
  <div v-if="inst" :class="['flow-card-box', hoverable ? 'flow-card-box-hoverable' : null]" @click="onCardClick()">
    <div class="header">
      <a-typography-text bold class="name">{{ inst.name }}</a-typography-text>
      <div class="status">
        <a-tag color="blue" v-if="inst.status == STATUS_LIST[0].value">{{ STATUS_LIST[0].name }}</a-tag>
        <a-tag color="green" v-else-if="inst.status == STATUS_LIST[1].value">{{ STATUS_LIST[1].name }}</a-tag>
        <a-tag color="red" v-else-if="inst.status == STATUS_LIST[2].value">{{ STATUS_LIST[2].name }}</a-tag>
        <a-tag color="orangered" v-else-if="inst.status == STATUS_LIST[3].value">{{ STATUS_LIST[3].name }}</a-tag>
      </div>
    </div>
    <div class="summary-list">
      <div
        v-for="(item, index) in (inst.summary || []).slice(0, 2)"
        :key="`${item.label}-${index}`"
        class="summary-item"
      >
        <div class="label">{{ item.label }}：</div>
        <div class="value" :title="formatFlowSummaryItem(item, organStore)">{{ formatFlowSummaryItem(item, organStore) }}</div>
      </div>
    </div>
    <div class="footer">
      <div class="initiator">
        <flow-node-avatar :size="20" :id="inst.initiatorId" />
      </div>
      <div class="begin-time">提交于 {{ formatUtcDateTime(inst.beginTime) }}</div>
    </div>

    <!-- 流程详情侧边栏 -->
    <a-drawer
      v-if="clickable"
      class="flow-card-detail-drawer"
      :width="770"
      :visible="flowDetailVisible"
      @ok="onDetailClose()"
      @cancel="onDetailClose()"
      unmountOnClose
      :footer="false"
      :header="false">
      <flow-detail v-model:flow-inst="inst" :cancelable="false" :actionable="false" :commentable="false" />
    </a-drawer>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import FlowInstApi from "@/api/FlowInstApi";
import FlowNodeAvatar from "@/components/common/FlowNodeAvatar.vue";
import { useOrganStore } from "@/store";
import { STATUS_LIST } from "@/components/flow/common/FlowConstant";
import { formatUtcDateTime } from "@/utils/date";
import { ref, watch } from "vue";
import FlowDetail from "./flow-detail.vue";
import { formatFlowSummaryItem } from "./flow-summary";

const props = defineProps({
  flowInst: { type: Object, default: null },
  flowInstId: { type: String, default: null },
  clickable: { type: Boolean, default: false },
  hoverable: { type: Boolean, default: true },
});

const organStore = useOrganStore();

const inst = ref(null);
watch(
  props,
  (nv) => {
    let id = props.flowInstId;
    if (id) {
      FlowInstApi.getById({ flowInstId: id }).then((resp) => {
        if (resp.code == 1) inst.value = resp.data || {};
      });
    } else {
      inst.value = nv.flowInst || {};
    }
  },
  { immediate: true, deep: true }
);

// 流程详情
const flowDetailVisible = ref(false);
const onCardClick = () => {
  if (props.clickable) flowDetailVisible.value = true;
};
const onDetailClose = () => {
  flowDetailVisible.value = false;
};
</script>

<style lang="less" scoped>
@import "@/styles/variables.module.less";

.flow-card-box {
  user-select: none;
  border-radius: @BorderRadius;
  overflow: hidden;
  border: 1px solid var(--color-border-2);
  background: var(--color-bg-2);
  padding: 10px 12px;
  cursor: pointer;
  transition: box-shadow 0.2s cubic-bezier(0, 0, 1, 1);
  // scroll-snap-align: start;
  // scroll-snap-type: y mandatory;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .name {
      font-size: 15px;
      color: var(--color-text-1);
    }
  }

  .summary-list {
    margin-top: 10px;
    min-width: 0;

    .summary-item {
      display: flex;
      align-items: center;
      min-height: 20px;
      min-width: 0;

      .label {
        color: var(--color-text-3);
        // width: @FlowCardFieldLabelWidth;
        overflow: hidden;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .value {
        color: var(--color-text-1);
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .footer {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;

    .initiator {
      display: flex;
      align-items: center;
    }

    .begin-time {
      color: var(--color-neutral-6);
    }
  }
}

.flow-card-box-hoverable {
  &:hover {
    box-shadow: 4px 4px 12px rgb(var(--gray-3));
  }
}
</style>

<style lang="less">
.flow-card-detail-drawer {
  .arco-drawer-body {
    padding: 0;
  }
}
</style>
