<template>
  <div class="page-container">
    <div class="page-container-body">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped lang="less">
  @import '@/styles/variables.module.less';

  .page-container {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    min-height: 100%;
    padding: @Gap @GapLarge @GapLarge;
  }

  .page-container-body {
    flex: 1;
    min-height: 0;
  }
</style>
