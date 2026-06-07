<template>
  <PageContainer :breadcrumb="['menu.exception', 'menu.exception.403']">
    <div class="content">
      <a-result
        class="result"
        status="403"
        :subtitle="$t('exception.result.403.description')"
      />
      <a-button key="back" type="primary">
        {{ $t('exception.result.403.back') }}
      </a-button>
    </div>
  </PageContainer>
</template>

<script lang="ts" setup></script>

<script lang="ts">
  export default {
    name: '403',
  };
</script>

<style scoped lang="less">
  .content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 220px);
    text-align: center;
    background-color: var(--color-bg-1);
    border-radius: 4px;
  }
</style>
