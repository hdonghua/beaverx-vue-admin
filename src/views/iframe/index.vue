<template>
  <div class="iframe-container">
    <iframe
      v-if="frameSrc"
      :src="frameSrc"
      class="iframe"
      frameborder="0"
      allowfullscreen
    />
    <a-empty v-else description="外链地址无效" />
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';

  const route = useRoute();
  const frameSrc = computed(() =>
    String(route.meta.frameSrc || route.query.frameSrc || '')
  );
</script>

<style scoped lang="less">
  .iframe-container {
    width: 100%;
    height: 100%;
    min-height: 100%;
    background: var(--color-bg-2);
  }

  .iframe {
    display: block;
    width: 100%;
    height: 100%;
    min-height: calc(100vh - 160px);
    border: none;
  }
</style>
