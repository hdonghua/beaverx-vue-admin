<template>
  <a-color-picker
    v-if="type === 'color'"
    :model-value="defaultValue as string"
    size="small"
    @change="handleChange"
  />
  <a-input-number
    v-else-if="type === 'number'"
    :style="{ width: '80px' }"
    size="small"
    :model-value="defaultValue as number"
    @change="handleChange"
  />
  <a-switch
    v-else
    :model-value="defaultValue as boolean"
    size="small"
    @change="handleChange"
  />
</template>

<script lang="ts" setup>
  const props = defineProps({
    type: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
    defaultValue: {
      type: [String, Boolean, Number],
      default: '',
    },
  });
  const emit = defineEmits(['inputChange']);
  const handleChange = (value: unknown) => {
    emit('inputChange', {
      value,
      key: props.name,
    });
  };
</script>
