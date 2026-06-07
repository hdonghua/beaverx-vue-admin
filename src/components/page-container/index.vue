<template>
  <div class="page-container">
    <div
      v-if="showBreadcrumb"
      class="page-container-header"
    >
      <Breadcrumb :items="breadcrumb" />
    </div>
    <div class="page-container-body">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, PropType } from 'vue';

  const props = defineProps({
    breadcrumb: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    hideBreadcrumb: {
      type: Boolean,
      default: false,
    },
  });

  const showBreadcrumb = computed(
    () => !props.hideBreadcrumb && props.breadcrumb.length > 0
  );
</script>

<style scoped lang="less">
  @import '@/styles/variables.module.less';

  .page-container {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    min-height: 100%;
    padding: @Gap @GapLarge @GapLarge;
  }

  .page-container-header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    min-height: @AppBreadcrumbHeight;
    margin-bottom: @Gap;

    :deep(.container-breadcrumb) {
      margin: 0;
    }
  }

  .page-container-body {
    flex: 1;
    min-height: 0;
  }
</style>
