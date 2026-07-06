<template>
  <PageContainer>
    <div class="content">
      <a-result
        class="result"
        status="404"
        :subtitle="$t('exception.result.404.description')"
      >
      </a-result>
      <div class="operation-row">
        <a-button key="again" style="margin-right: 16px">
          {{ $t('exception.result.404.retry') }}
        </a-button>
        <a-button key="back" type="primary">
          {{ $t('exception.result.404.back') }}
        </a-button>
      </div>
    </div>
  </PageContainer>
</template>

<script lang="ts" setup></script>

<script lang="ts">
  export default {
    name: '404',
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
