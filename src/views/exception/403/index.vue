<template>
  <PageContainer>
    <div class="content">
      <a-result
        class="result"
        status="403"
        subtitle="对不起，您没有访问该资源的权限"
      />
      <a-button key="back" type="primary" @click="back">
        返回
      </a-button>
    </div>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const back = () => {
    router.push({ name: 'Home' });
  };
</script>

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
