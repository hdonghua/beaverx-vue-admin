<template>
  <div class="channel-config-form">
    <a-alert
      v-if="providerType === PaymentProviderType.Sandbox"
      type="info"
      show-icon
      class="sandbox-tip"
    >
      沙箱渠道无需额外配置，可直接用于本地联调。
    </a-alert>
    <template v-else>
      <a-form-item v-for="field in fields" :key="field.key" :label="field.label">
        <a-textarea
          v-if="field.type === 'textarea'"
          v-model="configValues[field.key]"
          :auto-size="{ minRows: field.rows || 3, maxRows: 10 }"
          :placeholder="field.placeholder"
        />
        <a-input
          v-else
          v-model="configValues[field.key]"
          :placeholder="field.placeholder"
        />
      </a-form-item>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { computed, reactive, watch } from 'vue';
  import { PaymentProviderType } from '@/api/server/payment-channel';
  import {
    PAYMENT_CHANNEL_CONFIG_FIELDS,
    createEmptyChannelConfig,
    mergeChannelConfig,
  } from '@/constants/payment-channel-config';

  const props = defineProps<{
    providerType: PaymentProviderType;
    configJson?: string;
  }>();

  const configValues = reactive<Record<string, string>>({});

  const fields = computed(
    () => PAYMENT_CHANNEL_CONFIG_FIELDS[props.providerType] || []
  );

  function resetValues() {
    const merged = props.configJson
      ? mergeChannelConfig(props.providerType, props.configJson)
      : createEmptyChannelConfig(props.providerType);
    Object.keys(configValues).forEach((key) => {
      delete configValues[key];
    });
    Object.assign(configValues, merged);
  }

  watch(
    () => [props.providerType, props.configJson],
    () => resetValues(),
    { immediate: true }
  );

  defineExpose({
    getValues: () => ({ ...configValues }),
    resetValues,
  });
</script>

<style scoped lang="less">
  .sandbox-tip {
    margin-bottom: 8px;
  }
</style>
