<template>
  <a-select
    :model-value="modelValue"
    :options="resolvedOptions"
    :loading="loading"
    :placeholder="placeholder"
    :allow-clear="allowClear"
    :disabled="disabled"
    v-bind="$attrs"
    @update:model-value="handleChange"
  />
</template>

<script lang="ts" setup>
  import { computed, toRef } from 'vue';
  import { useDictOptions } from '@/hooks/use-dict-options';

  defineOptions({
    inheritAttrs: false,
  });

  const props = withDefaults(
    defineProps<{
      typeCode: string;
      modelValue?: string | number;
      valueType?: 'string' | 'number';
      placeholder?: string;
      allowClear?: boolean;
      disabled?: boolean;
    }>(),
    {
      valueType: 'string',
      placeholder: '请选择',
      allowClear: false,
      disabled: false,
    }
  );

  const emit = defineEmits<{
    'update:modelValue': [value: string | number | undefined];
    change: [value: string | number | undefined];
  }>();

  const { loading, toSelectOptions } = useDictOptions(toRef(props, 'typeCode'));

  const resolvedOptions = computed(() => toSelectOptions(props.valueType));

  const handleChange = (value: string | number | undefined) => {
    emit('update:modelValue', value);
    emit('change', value);
  };
</script>

<script lang="ts">
  export default {
    name: 'DictSelect',
  };
</script>
