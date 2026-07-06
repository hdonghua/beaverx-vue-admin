<template>
  <PageContainer>
    <a-card class="general-card" title="SignaturePad 签名板">
      <DemoSection
        title="手写签名"
        description="在画布内签名后点击「签署」导出 Base64 图片。width / height 需传确定数值。"
      >
        <div class="pad-wrap">
          <SignaturePad
            width="560"
            height="220"
            @ok="handleOk"
            @clear="handleClear"
          />
        </div>
        <div v-if="imageData" class="result">
          <div class="result-title">签名预览</div>
          <img :src="imageData" alt="signature" class="result-image" />
        </div>
        <template #code>
&lt;SignaturePad
  width="560"
  height="220"
  @ok="(base64) => (imageData = base64)"
  @clear="() => (imageData = '')"
/&gt;
        </template>
      </DemoSection>
    </a-card>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import PageContainer from '@/components/page-container/index.vue';
  import SignaturePad from '@/components/common/SignaturePad.vue';
  import DemoSection from '../_demo/demo-section.vue';

  const imageData = ref('');

  function handleOk(base64: string) {
    imageData.value = base64;
    Message.success('签名已生成');
  }

  function handleClear() {
    imageData.value = '';
  }
</script>

<style scoped lang="less">
  .pad-wrap {
    position: relative;
    width: 560px;
    max-width: 100%;
    height: 260px;
  }

  .result {
    margin-top: 16px;

    &-title {
      margin-bottom: 8px;
      color: var(--color-text-2);
    }

    &-image {
      max-width: 320px;
      border: 1px solid var(--color-border-2);
      border-radius: var(--border-radius-small);
      background: #fff;
    }
  }
</style>
