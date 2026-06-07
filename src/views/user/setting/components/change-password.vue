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
      <a-form-item
        field="oldPassword"
        label="原密码"
        :rules="[{ required: true, message: '请输入原密码' }]"
      >
        <a-input-password
          v-model="formData.oldPassword"
          placeholder="请输入原密码"
          allow-clear
        />
      </a-form-item>
      <a-form-item
        field="newPassword"
        label="新密码"
        :rules="[{ required: true, message: '请输入新密码' }]"
      >
        <a-input-password
          v-model="formData.newPassword"
          placeholder="请输入新密码"
          allow-clear
        />
      </a-form-item>
      <a-form-item
        field="confirmPassword"
        label="确认密码"
        :rules="confirmPasswordRules"
      >
        <a-input-password
          v-model="formData.confirmPassword"
          placeholder="请再次输入新密码"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" :loading="submitting" @click="handleSubmit">
            确认修改
          </a-button>
          <a-button @click="resetForm">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
  import { nextTick, reactive, ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { FormInstance } from '@arco-design/web-vue/es/form';
  import { changePassword } from '@/api/server/auth';

  const formRef = ref<FormInstance>();
  const submitting = ref(false);
  const formData = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const confirmPasswordRules = [
    { required: true, message: '请确认新密码' },
    {
      validator: (value: string, callback: (error?: string) => void) => {
        if (value !== formData.newPassword) {
          callback('两次输入的密码不一致');
        } else {
          callback();
        }
      },
    },
  ];

  const resetForm = async () => {
    formData.oldPassword = '';
    formData.newPassword = '';
    formData.confirmPassword = '';
    await nextTick();
    formRef.value?.clearValidate();
    formRef.value?.resetFields();
  };

  const handleSubmit = async () => {
    const validErr = await formRef.value?.validate();
    if (validErr) {
      return;
    }
    submitting.value = true;
    try {
      await changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      Message.success('密码修改成功');
      await resetForm();
    } finally {
      submitting.value = false;
    }
  };
</script>

<style scoped lang="less">
  .form-section {
    max-width: 520px;
    padding: 8px 0 16px;
  }
</style>
