<template>
  <span v-if="plain">{{ label }}</span>
  <a-tag v-else :color="color" :size="size">
    {{ label }}
  </a-tag>
</template>

<script lang="ts" setup>
  import { computed, toRef } from 'vue';
  import { useDictOptions } from '@/hooks/use-dict-options';

  const props = withDefaults(
    defineProps<{
      typeCode: string;
      value?: string | number | null;
      fallback?: string;
      size?: 'small' | 'medium' | 'large';
      /** 为 true 时仅渲染文本，不使用 Tag 样式 */
      plain?: boolean;
    }>(),
    {
      fallback: '-',
      size: 'small',
      plain: false,
    }
  );

  const { options, loaded, getLabel, getTagColor } = useDictOptions(
    toRef(props, 'typeCode')
  );

  const label = computed(() => {
    void loaded.value;
    void options.value;
    return getLabel(props.value, props.fallback);
  });

  const color = computed(() => {
    void loaded.value;
    void options.value;
    return getTagColor(props.value);
  });
</script>

<script lang="ts">
  export default {
    name: 'DictTag',
  };
</script>
