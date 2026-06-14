<template>
  <div class="channel-config-form">
    <a-row :gutter="16">
      <a-col
        v-for="field in fields"
        :key="field.key"
        :span="field.colSpan ?? 12"
      >
        <a-form-item :label="field.label">
          <template v-if="field.type === 'cert-upload'">
            <a-upload
              :show-file-list="false"
              accept=".crt,.cer,.pem"
              :disabled="uploadingKey === field.key"
              :custom-request="(option) => handleCertUpload(field, option)"
            >
              <template #upload-button>
                <a-button
                  type="outline"
                  :loading="uploadingKey === field.key"
                >
                  <template #icon><icon-upload /></template>
                  {{ getCertFileName(field) ? '重新上传' : '上传证书' }}
                </a-button>
              </template>
            </a-upload>
            <div v-if="getCertFileName(field)" class="cert-tip uploaded">
              已上传：
              <a
                v-if="getCertUrl(field)"
                class="cert-link"
                :href="getCertUrl(field)"
                :download="getCertFileName(field)"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ getCertFileName(field) }}
              </a>
              <span v-else>{{ getCertFileName(field) }}</span>
            </div>
            <div v-if="getCertPath(field)" class="cert-tip">
              本地路径：{{ getCertPath(field) }}
            </div>
          </template>
          <a-select
            v-else-if="field.type === 'select'"
            v-model="configValues[field.key]"
            :placeholder="field.placeholder || '请选择'"
            allow-clear
          >
            <a-option
              v-for="option in field.options || []"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            />
          </a-select>
          <a-textarea
            v-else-if="field.type === 'textarea'"
            v-model="configValues[field.key]"
            :auto-size="{ minRows: field.rows || 3, maxRows: 8 }"
            :placeholder="field.placeholder"
          />
          <a-input
            v-else
            v-model="configValues[field.key]"
            :placeholder="field.placeholder"
          />
          <template v-if="field.hint" #extra>
            {{ field.hint }}
          </template>
        </a-form-item>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref, watch } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import type { RequestOption } from '@arco-design/web-vue/es/upload/interfaces';
  import { PaymentProviderType } from '@/api/server/payment/channel';
  import { uploadFile } from '@/api/server/common/file';
  import { resolveApiUrl } from '@/utils/asset-url';
  import {
    PAYMENT_CHANNEL_CONFIG_FIELDS,
    createEmptyChannelConfig,
    mergeChannelConfig,
    type PaymentChannelConfigField,
  } from '@/constants/payment-channel-config';

  const props = defineProps<{
    providerType: PaymentProviderType;
    configJson?: string;
  }>();

  const configValues = reactive<Record<string, string>>({});
  const uploadingKey = ref<string>();

  const fields = computed(
    () => PAYMENT_CHANNEL_CONFIG_FIELDS[props.providerType] || []
  );

  function getCertFileName(field: PaymentChannelConfigField) {
    if (!field.fileNameKey) {
      return '';
    }
    return configValues[field.fileNameKey] || '';
  }

  function getCertUrl(field: PaymentChannelConfigField) {
    const url = configValues[field.key]?.trim();
    return url ? resolveApiUrl(url) : '';
  }

  function getCertPath(field: PaymentChannelConfigField) {
    if (!field.pathKey) {
      return '';
    }
    return configValues[field.pathKey] || '';
  }

  function resetValues() {
    const merged = props.configJson
      ? mergeChannelConfig(props.providerType, props.configJson)
      : createEmptyChannelConfig(props.providerType);
    Object.keys(configValues).forEach((key) => {
      delete configValues[key];
    });
    Object.assign(configValues, merged);
  }

  function handleCertUpload(
    field: PaymentChannelConfigField,
    option: RequestOption
  ) {
    const { fileItem, onError, onSuccess } = option;
    const rawFile = fileItem.file;
    if (!rawFile) {
      onError(new Error('未选择文件'));
      return { abort: () => {} };
    }

    uploadingKey.value = field.key;
    let aborted = false;

    uploadFile(rawFile, 'payment-cert')
      .then(({ data }) => {
        if (aborted) {
          return;
        }
        configValues[field.key] = data.proxyUrl;
        if (field.fileNameKey) {
          configValues[field.fileNameKey] = data.fileName;
        }
        if (field.pathKey) {
          configValues[field.pathKey] = '';
        }
        Message.success(`${field.label}上传成功`);
        onSuccess();
      })
      .catch((err: Error) => {
        if (!aborted) {
          onError(err);
        }
      })
      .finally(() => {
        if (!aborted) {
          uploadingKey.value = undefined;
        }
      });

    return {
      abort: () => {
        aborted = true;
        uploadingKey.value = undefined;
      },
    };
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
  .channel-config-form {
    :deep(.arco-form-item) {
      margin-bottom: 12px;
    }
  }

  .cert-tip {
    margin-top: 8px;
    color: var(--color-text-3);
    font-size: 12px;

    &.uploaded {
      color: rgb(var(--green-6));
    }
  }

  .cert-link {
    color: rgb(var(--primary-6));
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
</style>
