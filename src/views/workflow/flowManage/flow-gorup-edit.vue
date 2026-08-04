<template>
  <a-modal
    :visible="showAddGroup"
    modal-class="new-group-box"
    ok-text="保存"
    @ok="onSaveGroup()"
    @cancel="close()"
  >
    <template #title> 新建流程分组 </template>
    <div>
      <a-form :model="group" :rules="newGroupRules" ref="newGroupFormRef">
        <a-form-item field="name" label="分组名称" required="">
          <a-input
            v-model="group.name"
            :max-length="16"
            placeholder="请输入流程分组名称"
          />
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
// @ts-nocheck
  import { Notification } from '@arco-design/web-vue';
  import { addProcessGroup, AddProcessGroupResponse } from '@/api/server/workflow/approveManagement';
  import { ref, toRaw } from 'vue';

  /** 分组对象 */
  interface GroupType {
    name?: string;
    id?: string;
    [key: string]: any;
  }

  let emits = defineEmits<{
    (e: 'ok', data: AddProcessGroupResponse): void;
  }>();
  const props = defineProps<{
    group: GroupType;
  }>();

  let showAddGroup = ref(false);
  const newGroupFormRef = ref();
  const newGroupRules = ref({
    name: { required: true, message: '分组名称不能为空', minLength: 1 },
  });
  const onSaveGroup = () => {
    newGroupFormRef.value.validate((err: any) => {
      if (err) return;
      addProcessGroup(toRaw(props.group) as { name: string }).then((resp) => {
        emits('ok', resp.data);
        Notification.success('分组新建成功');
      });
      close();
    });
  };
  const show = () => {
    showAddGroup.value = true;
  };
  const close = () => {
    showAddGroup.value = false;
    newGroupFormRef.value.resetFields();
  };

  defineExpose({ show, close });
</script>
