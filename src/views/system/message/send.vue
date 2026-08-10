<template>
  <PageContainer>
    <a-card class="general-card">
      <a-form ref="formRef" :model="form" layout="vertical" class="send-form">
        <a-form-item field="sendToAll">
          <a-checkbox v-model="form.sendToAll">
            发送给全部启用用户
          </a-checkbox>
        </a-form-item>

        <a-form-item
          v-if="!form.sendToAll"
          field="userId"
          label="接收用户"
          :rules="[{ required: true, message: '请选择接收用户' }]"
        >
          <a-select
            v-model="form.userId"
            allow-search
            allow-clear
            :loading="userLoading"
            placeholder="请选择用户"
          >
            <a-option
              v-for="user in userOptions"
              :key="user.id"
              :value="user.id"
              :label="formatUserLabel(user)"
            />
          </a-select>
        </a-form-item>

        <a-form-item
          field="type"
          label="消息分类"
          :rules="[{ required: true, message: '请选择消息分类' }]"
        >
          <a-radio-group v-model="form.type">
            <a-radio value="notice">通知</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item
          field="title"
          label="标题"
          :rules="[{ required: true, message: '请输入标题' }]"
        >
          <a-input
            v-model="form.title"
            :max-length="128"
            show-word-limit
            placeholder="请输入消息标题"
          />
        </a-form-item>

        <a-form-item field="subTitle" label="副标题">
          <a-input
            v-model="form.subTitle"
            :max-length="128"
            show-word-limit
            placeholder="可选，如「的回复」"
          />
        </a-form-item>

        <a-form-item
          field="content"
          label="内容"
          :rules="[{ required: true, message: '请输入内容' }]"
        >
          <a-textarea
            v-model="form.content"
            :auto-size="{ minRows: 4, maxRows: 10 }"
            :max-length="2000"
            show-word-limit
            placeholder="请输入消息正文"
          />
        </a-form-item>

        <a-form-item
          v-if="form.type === 'notice' || form.type === 'todo'"
          field="messageType"
          label="展示标签"
        >
          <a-select
            v-model="form.messageType"
            allow-clear
            placeholder="可选，用于通知/待办角标样式"
          >
            <a-option :value="0">未开始</a-option>
            <a-option :value="1">已开通</a-option>
            <a-option :value="2">进行中</a-option>
            <a-option :value="3">即将到期</a-option>
          </a-select>
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button
              type="primary"
              :loading="submitting"
              v-permission="[Permissions.System.Message.Send]"
              @click="handleSubmit"
            >
              发送
            </a-button>
            <a-button @click="resetForm">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { queryUserPage, UserDto } from '@/api/server/rbac/user';
  import { sendSiteMessage } from '@/api/server/message/site-message';
  import { Permissions } from '@/constants/permissions';
  import type { EntityId } from '@/types/entity-id';

    const formRef = ref();
  const submitting = ref(false);
  const userLoading = ref(false);
  const userOptions = ref<UserDto[]>([]);

  const defaultForm = () => ({
    userId: undefined as EntityId | undefined,
    sendToAll: false,
    type: 'notice' as 'message' | 'notice' | 'todo',
    title: '',
    subTitle: '',
    content: '',
    messageType: undefined as number | undefined,
  });

  const form = reactive(defaultForm());

  function formatUserLabel(user: UserDto) {
    const nick = user.nickName?.trim();
    return nick ? `${user.userName}（${nick}）` : user.userName;
  }

  async function loadUsers() {
    userLoading.value = true;
    try {
      const { data } = await queryUserPage({
        current: 1,
        pageSize: 500,
      });
      userOptions.value = (data.items || []).filter((item) => item.isEnabled);
    } catch {
      Message.error('加载用户列表失败');
    } finally {
      userLoading.value = false;
    }
  }

  function resetForm() {
    Object.assign(form, defaultForm());
    formRef.value?.clearValidate();
  }

  async function handleSubmit() {
    const errors = await formRef.value?.validate();
    if (errors) {
      return;
    }

    submitting.value = true;
    try {
      const { data } = await sendSiteMessage({
        userId: form.sendToAll ? null : form.userId,
        sendToAll: form.sendToAll,
        title: form.title.trim(),
        subTitle: form.subTitle?.trim() || undefined,
        content: form.content.trim(),
        type: form.type,
        messageType: form.messageType ?? null,
      });

      if (data.failCount > 0) {
        Message.warning(
          `发送完成：成功 ${data.successCount} 条，失败 ${data.failCount} 条`
        );
      } else {
        Message.success(`已成功发送 ${data.successCount} 条站内信`);
      }
      resetForm();
    } catch {
      // interceptor handles error toast
    } finally {
      submitting.value = false;
    }
  }

  onMounted(() => {
    void loadUsers();
  });
</script>
