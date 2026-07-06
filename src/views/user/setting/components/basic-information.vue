<template>
  <div class="form-section">
    <a-form
      ref="formRef"
      :model="formData"
      layout="horizontal"
      :label-col-props="{ span: 5 }"
      :wrapper-col-props="{ span: 19 }"
      auto-label-width
    >
      <a-form-item field="userName" label="账号">
        <a-input :model-value="formData.userName" disabled />
      </a-form-item>
      <a-form-item
        field="nickName"
        label="昵称"
        :rules="[{ required: true, message: '请输入昵称' }]"
      >
        <a-input v-model="formData.nickName" placeholder="请输入昵称" />
      </a-form-item>
      <a-form-item field="email" label="邮箱">
        <a-input v-model="formData.email" placeholder="请输入邮箱" />
      </a-form-item>
      <a-form-item field="phone" label="手机号">
        <a-input v-model="formData.phone" placeholder="请输入手机号" />
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" :loading="submitting" @click="handleSave">
            保存
          </a-button>
          <a-button @click="loadProfile">
            重置
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { FormInstance } from '@arco-design/web-vue/es/form';
  import { getProfile, updateProfile } from '@/api/server/auth';
  import { useUserStore } from '@/store';

  const emit = defineEmits<{ saved: [] }>();
  const userStore = useUserStore();
  const formRef = ref<FormInstance>();
  const submitting = ref(false);
  const formData = reactive({
    userName: '',
    nickName: '',
    email: '',
    phone: '',
  });

  const loadProfile = async () => {
    const { data } = await getProfile();
    formData.userName = data.userName;
    formData.nickName = data.nickName || '';
    formData.email = data.email || '';
    formData.phone = data.phone || '';
    userStore.applyProfile(data);
  };

  const handleSave = async () => {
    const validErr = await formRef.value?.validate();
    if (validErr) {
      return;
    }
    submitting.value = true;
    try {
      const { data } = await updateProfile({
        nickName: formData.nickName,
        email: formData.email,
        phone: formData.phone
      });
      userStore.applyProfile(data);
      Message.success('保存成功');
      emit('saved');
    } finally {
      submitting.value = false;
    }
  };

  onMounted(() => {
    loadProfile();
  });
</script>

<style scoped lang="less">
  .form-section {
    max-width: 520px;
    padding: 8px 0 16px;
  }
</style>
