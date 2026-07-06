<template>
  <PageContainer>
    <div class="content">
      <a-result
        class="result"
        status="500"
        subtitle="抱歉，服务器出了点问题～"
      />
      <a-button key="back" type="primary">
        返回
      </a-button>
    </div>
  </PageContainer>
</template>

<script lang="ts">
  export default {
    name: '500',
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
