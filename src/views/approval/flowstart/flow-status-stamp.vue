<!-- 流程印章 -->
<template>
  <div class="flow-stamp-container">
    <img :style="style" :src="approvedImg" v-if="status == STATUS.APPROVED" />
    <img :style="style" :src="rejectedImg" v-else-if="status == STATUS.REJECTED" />
    <img :style="style" :src="underwayImg" v-else-if="status == STATUS.UNDERWAY" />
    <img :style="style" :src="canceledImg" v-else-if="status == STATUS.CANCELLED" />
  </div>
</template>

<script setup>
import { STATUS } from "@/components/flow/common/FlowConstant";
import { computed } from "vue";
import approvedImg from '@/assets/stamp/approved.svg?url'
import rejectedImg from '@/assets/stamp/rejected.svg?url'
import underwayImg from '@/assets/stamp/underway.svg?url'
import canceledImg from '@/assets/stamp/canceled.svg?url'

let props = defineProps({
  status: Number,
  size: { type: Number, default: 48 },
});

let style = computed(() => {
  return {
    width: props.size + "px",
    height: props.size + "px",
  };
});
</script>

<style lang="less" scoped>
.flow-stamp-container {
  img {
    overflow: hidden;
    background-color: transparent;
    z-index: 999;
  }
}
</style>
