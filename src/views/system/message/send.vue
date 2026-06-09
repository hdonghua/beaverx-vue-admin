<template>
  <PageContainer :breadcrumb="['menu.system', 'menu.system.messageSend']">
    <a-card class="general-card" :title="$t('siteMessage.cardTitle')">
      <a-form ref="formRef" :model="form" layout="vertical" class="send-form">
        <a-form-item field="sendToAll">
          <a-checkbox v-model="form.sendToAll">
            {{ $t('siteMessage.sendToAll') }}
          </a-checkbox>
        </a-form-item>

        <a-form-item
          v-if="!form.sendToAll"
          field="userId"
          :label="$t('siteMessage.receiver')"
          :rules="[{ required: true, message: $t('siteMessage.receiverRequired') }]"
        >
          <a-select
            v-model="form.userId"
            allow-search
            allow-clear
            :loading="userLoading"
            :placeholder="$t('siteMessage.receiverPlaceholder')"
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
          :label="$t('siteMessage.type')"
          :rules="[{ required: true, message: $t('siteMessage.typeRequired') }]"
        >
          <a-radio-group v-model="form.type">
            <!-- <a-radio value="message">{{ $t('siteMessage.type.message') }}</a-radio> -->
            <a-radio value="notice">{{ $t('siteMessage.type.notice') }}</a-radio>
            <!-- <a-radio value="todo">{{ $t('siteMessage.type.todo') }}</a-radio> -->
          </a-radio-group>
        </a-form-item>

        <a-form-item
          field="title"
          :label="$t('siteMessage.title')"
          :rules="[{ required: true, message: $t('siteMessage.titleRequired') }]"
        >
          <a-input
            v-model="form.title"
            :max-length="128"
            show-word-limit
            :placeholder="$t('siteMessage.titlePlaceholder')"
          />
        </a-form-item>

        <a-form-item field="subTitle" :label="$t('siteMessage.subTitle')">
          <a-input
            v-model="form.subTitle"
            :max-length="128"
            show-word-limit
            :placeholder="$t('siteMessage.subTitlePlaceholder')"
          />
        </a-form-item>

        <a-form-item
          field="content"
          :label="$t('siteMessage.content')"
          :rules="[{ required: true, message: $t('siteMessage.contentRequired') }]"
        >
          <a-textarea
            v-model="form.content"
            :auto-size="{ minRows: 4, maxRows: 10 }"
            :max-length="2000"
            show-word-limit
            :placeholder="$t('siteMessage.contentPlaceholder')"
          />
        </a-form-item>

        <a-form-item
          v-if="form.type === 'notice' || form.type === 'todo'"
          field="messageType"
          :label="$t('siteMessage.messageType')"
        >
          <a-select
            v-model="form.messageType"
            allow-clear
            :placeholder="$t('siteMessage.messageTypePlaceholder')"
          >
            <a-option :value="0">{{ $t('siteMessage.messageTypeOptions.pending') }}</a-option>
            <a-option :value="1">{{ $t('siteMessage.messageTypeOptions.opened') }}</a-option>
            <a-option :value="2">{{ $t('siteMessage.messageTypeOptions.processing') }}</a-option>
            <a-option :value="3">{{ $t('siteMessage.messageTypeOptions.expiring') }}</a-option>
          </a-select>
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" :loading="submitting" @click="handleSubmit">
              {{ $t('siteMessage.submit') }}
            </a-button>
            <a-button @click="resetForm">{{ $t('siteMessage.reset') }}</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';
  import { queryUserPage, UserDto } from '@/api/server/user';
  import { sendSiteMessage } from '@/api/server/site-message';

  const { t } = useI18n();
  const formRef = ref();
  const submitting = ref(false);
  const userLoading = ref(false);
  const userOptions = ref<UserDto[]>([]);

  const defaultForm = () => ({
    userId: undefined as number | undefined,
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
      Message.error(t('siteMessage.loadUsersFailed'));
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
          t('siteMessage.partialSuccess', {
            success: data.successCount,
            fail: data.failCount,
          })
        );
      } else {
        Message.success(
          t('siteMessage.success', { count: data.successCount })
        );
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

<style scoped lang="less">
  .send-form {
    max-width: 720px;
  }
</style>
