<template>
  <div class="flow-icon-box" :style="boxStyle">
    <img v-if="icon" :src="ICON_BASE_URL + icon" :style="boxStyle" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { ICON_BASE_URL } from '@/api/icon';

const props = defineProps({
  icon: { type: String, default: '' },
  size: { type: Number, default: 48 },
});

const boxStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}));
</script>

<style lang="less">
.flow-icon-box {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
}
</style>
