<template>
  <PageContainer>
    <QueryTable
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      :columns="columns"
      :data="renderData"
      :search-form-model="formModel"
      @page-change="onPageChange"
      @refresh="search"
    >
      <template #search>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="name" label="账号">
              <a-input
                v-model="formModel.userName"
                placeholder="请输入账号"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-space :size="18">
              <a-button type="primary" @click="search">
                <template #icon>
                  <icon-search />
                </template>
                搜索
              </a-button>
              <a-button @click="reset">
                <template #icon>
                  <icon-refresh />
                </template>
                重置
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </template>
      <template #toolbar-left>
        <a-space>
          <a-button
            type="primary"
            v-permission="[Permissions.System.User.Create]"
            @click="handleAdd"
          >
            <template #icon>
              <icon-plus />
            </template>
            新增
          </a-button>
          <a-button @click="handleExport">
            <template #icon>
              <icon-download />
            </template>
            导出
          </a-button>
        </a-space>
      </template>
      <template #index="{ rowIndex }">
        {{ rowIndex + 1 + (pagination.current - 1) * pagination.pageSize }}
      </template>
      <template #roleNames="{ record }">
        {{ record.roleNames?.join('、') || '-' }}
      </template>
      <template #isEnabled="{ record }">
        <a-switch
          :model-value="record.isEnabled"
          :loading="togglingUserId === record.id"
          @change="(value) => handleToggleEnabled(record, value)"
        />
      </template>
      <template #creationTime="{ record }">
        {{ dayjs(record.creationTime).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template #operations="{ record }">
        <a-space>
          <a-tooltip content="分配角色">
            <a-button
              type="text"
              size="small"
              v-permission="[Permissions.System.User.AssignRoles]"
              @click="handleAssignRole(record.id)"
            >
              <template #icon>
                <icon-safe />
              </template>
            </a-button>
          </a-tooltip>
          <a-tooltip content="重置密码">
            <a-button
              type="text"
              size="small"
              @click="handleResetPassword(record)"
              v-permission="[Permissions.System.User.ResetPassword]"
            >
              <template #icon>
                <icon-lock />
              </template>
            </a-button>
          </a-tooltip>
        </a-space>
      </template>
    </QueryTable>
    <a-modal
      v-model:visible="modalVisible"
      title="创建用户"
      unmount-on-close
      @close="resetCreateUserForm"
      @before-ok="handleBeforeOk"
    >
      <a-form ref="operationFormRef" layout="vertical" :model="operationForm">
        <a-form-item
          field="userName"
          label="账号"
          :rules="[{ required: true, message: '账号不能为空' }]"
        >
          <a-input v-model="operationForm.userName" />
        </a-form-item>
        <a-form-item
          field="password"
          label="密码"
          :rules="passwordRules"
        >
          <a-input-password
            v-model="operationForm.password"
            allow-clear
            placeholder="8-32 位，含大小写字母、数字和特殊字符"
          />
        </a-form-item>
        <a-form-item field="nickName" label="昵称">
          <a-input v-model="operationForm.nickName" />
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal
      v-model:visible="roleModalVisible"
      title="分配角色"
      @cancel="handleRoleCancel"
      @before-ok="handleRoleBeforeOk"
    >
      <a-form layout="vertical" :model="roleForm">
        <a-form-item field="roleIds" label="角色">
          <a-select
            v-model="roleForm.roleIds"
            multiple
            placeholder="请选择角色"
            :options="roleOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal
      v-model:visible="passwordModalVisible"
      title="重置密码"
      unmount-on-close
      @close="resetPasswordForm"
      @before-ok="handlePasswordBeforeOk"
    >
      <a-form ref="passwordFormRef" layout="vertical" :model="passwordForm">
        <a-form-item label="用户">
          <a-input :model-value="resetUserName" disabled />
        </a-form-item>
        <a-form-item
          field="newPassword"
          label="新密码"
          :rules="passwordRules"
        >
          <a-input-password
            v-model="passwordForm.newPassword"
            allow-clear
            placeholder="8-32 位，含大小写字母、数字和特殊字符"
          />
        </a-form-item>
        <a-form-item
          field="confirmPassword"
          label="确认密码"
          :rules="confirmPasswordRules"
        >
          <a-input-password
            v-model="passwordForm.confirmPassword"
            allow-clear
            placeholder="请再次输入新密码"
          />
        </a-form-item>
        <a-typography-text type="secondary" class="password-hint">
          {{ PASSWORD_RULE_MESSAGE }}
        </a-typography-text>
      </a-form>
    </a-modal>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive, watch, nextTick } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import QueryTable from '@/components/common/QueryTable.vue';
  import useLoading from '@/hooks/loading';
  import {
    queryUserPage,
    addUser,
    updateUser,
    QueryUserPageRequest,
    UserDto,
    assignRole,
    getUserById,
    resetPassword,
  } from '@/api/server/rbac/user';
  import { queryRoleOptions, RoleOptionDto } from '@/api/server/rbac/role';
  import { Pagination } from '@/types/global';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import cloneDeep from 'lodash/cloneDeep';
  import Sortable from 'sortablejs';
  import { FormInstance } from '@arco-design/web-vue/es/form';
  import { clearFormValidate } from '@/utils/form';
  import { createExportTask, ExportTypes } from '@/api/server/system/export-task';
  import useExportTasks from '@/hooks/export-tasks';
  import { Permissions } from '@/constants/permissions';
  import type { EntityId } from '@/types/entity-id';
  import dayjs from 'dayjs';
  import {
    createConfirmPasswordRules,
    passwordRules,
    PASSWORD_RULE_MESSAGE,
  } from '@/utils/password';

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };

  const generateFormModel = () => {
    return {
      userName: '',
    };
  };
  const { loading, setLoading } = useLoading(true);
    const { refreshActiveCount } = useExportTasks();
  const renderData = ref<UserDto[]>([]);
  const formModel = ref(generateFormModel());
  const cloneColumns = ref<Column[]>([]);
  const showColumns = ref<Column[]>([]);

  const size = ref<SizeProps>('medium');

  const basePagination: Pagination = {
    current: 1,
    pageSize: 20,
  };
  const pagination = reactive({
    ...basePagination,
    total: 0,
  });
  const densityList = computed(() => [
    {
      name: '窄',
      value: 'mini',
    },
    {
      name: '小',
      value: 'small',
    },
    {
      name: '中',
      value: 'medium',
    },
    {
      name: '大',
      value: 'large',
    },
  ]);
  const columns = computed<TableColumnData[]>(() => [
    {
      title: '序号',
      dataIndex: 'index',
      slotName: 'index',
    },
    {
      title: '账号',
      dataIndex: 'userName',
    },
    {
      title: '昵称',
      dataIndex: 'nickName',
    },
    {
      title: '角色',
      dataIndex: 'roleNames',
      slotName: 'roleNames',
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      slotName: 'isEnabled',
      width: 90,
    },
    {
      title: '手机',
      dataIndex: 'phone',
    },
    {
      title: '创建时间',
      dataIndex: 'creationTime',
      slotName: 'creationTime',
    },
    {
      title: '操作',
      dataIndex: 'operations',
      slotName: 'operations',
      width: 120,
    },
  ]);
  const operationFormRef = ref<FormInstance>();
  const modalVisible = ref(false);
  const operationForm = reactive({
    userName: '',
    password: '',
    nickName: '',
  });

  const roleModalVisible = ref(false);
  const roleForm = reactive({
    roleIds: [] as EntityId[],
  });
  const roleOptions = ref<RoleOptionDto[]>([]);
  const currentUserId = ref<EntityId | null>(null);
  const togglingUserId = ref<EntityId | null>(null);

  const passwordModalVisible = ref(false);
  const passwordFormRef = ref<FormInstance>();
  const resetUserName = ref('');
  const passwordForm = reactive({
    newPassword: '',
    confirmPassword: '',
  });
  const confirmPasswordRules = createConfirmPasswordRules(
    () => passwordForm.newPassword
  );

  const resetCreateUserForm = () => {
    operationForm.userName = '';
    operationForm.password = '';
    operationForm.nickName = '';
    clearFormValidate(operationFormRef.value);
  };

  const handleBeforeOk = async (done: (closed: boolean) => void) => {
    const validErr = await operationFormRef.value?.validate();
    if (!validErr) {
      addUser(operationForm).then(() => {
        done(true);
        fetchData();
      });
    } else {
      done(false);
    }
  };
  const handleAdd = () => {
    resetCreateUserForm();
    modalVisible.value = true;
  };
  const handleExport = async () => {
    try {
      await createExportTask({
        exportType: ExportTypes.SystemUser,
        parameters: {
          keyword: formModel.value.userName || undefined,
        },
      });
      await refreshActiveCount();
      Message.success('导出任务已创建，请在顶部文件中心查看');
    } catch {
      // error handled by interceptor
    }
  };
  const handleAssignRole = async (id: EntityId) => {
    currentUserId.value = id;
    roleModalVisible.value = true;
    roleForm.roleIds = [];
    try {
      const { data: options } = await queryRoleOptions();
      roleOptions.value = options;
      const { data } = await getUserById(id);
      roleForm.roleIds = data.roleIds || [];
    } catch (err) {
      // error
    }
  };

  const handleRoleCancel = () => {
    roleModalVisible.value = false;
    roleForm.roleIds = [];
  };

  const handleRoleBeforeOk = async (done: (closed: boolean) => void) => {
    if (!currentUserId.value) {
      done(false);
      return;
    }
    try {
      await assignRole({
        userId: currentUserId.value,
        roleIds: roleForm.roleIds,
      });
      done(true);
      fetchData();
    } catch {
      done(false);
    }
  };

  const resetPasswordForm = () => {
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    resetUserName.value = '';
    clearFormValidate(passwordFormRef.value);
  };

  const handleResetPassword = (record: UserDto) => {
    currentUserId.value = record.id;
    resetUserName.value = record.nickName || record.userName;
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    passwordModalVisible.value = true;
    clearFormValidate(passwordFormRef.value);
  };

  const handlePasswordBeforeOk = async (done: (closed: boolean) => void) => {
    const validErr = await passwordFormRef.value?.validate();
    if (validErr) {
      done(false);
      return;
    }
    if (!currentUserId.value) {
      done(false);
      return;
    }
    try {
      await resetPassword({
        userId: currentUserId.value,
        newPassword: passwordForm.newPassword,
      });
      Message.success('密码重置成功');
      done(true);
      resetPasswordForm();
    } catch {
      done(false);
    }
  };

  const handleToggleEnabled = async (
    record: UserDto,
    value: boolean | string | number
  ) => {
    const nextEnabled = Boolean(value);
    if (nextEnabled === record.isEnabled) {
      return;
    }

    const previousEnabled = record.isEnabled;
    record.isEnabled = nextEnabled;
    togglingUserId.value = record.id;

    try {
      await updateUser({
        id: record.id,
        isEnabled: nextEnabled,
      });
      Message.success(nextEnabled ? '用户已启用' : '用户已禁用');
    } catch {
      record.isEnabled = previousEnabled;
    } finally {
      togglingUserId.value = null;
    }
  };

  const fetchData = async (
    params: QueryUserPageRequest = { current: 1, pageSize: 20 }
  ) => {
    setLoading(true);
    try {
      const { data } = await queryUserPage(params);
      renderData.value = data.items;
      pagination.current = params.current;
      pagination.total = data.total;
    } catch (err) {
      // you can report use errorHandler or other
    } finally {
      setLoading(false);
    }
  };

  const search = () => {
    fetchData({
      ...basePagination,
      ...formModel.value,
    });
  };
  const onPageChange = (current: number) => {
    fetchData({ ...basePagination, current, ...formModel.value });
  };

  fetchData();
  const reset = () => {
    formModel.value = generateFormModel();
  };

  const handleSelectDensity = (
    val: string | number | Record<string, any> | undefined,
    e: Event
  ) => {
    size.value = val as SizeProps;
  };

  const handleChange = (
    checked: boolean | (string | boolean | number)[],
    column: Column,
    index: number
  ) => {
    if (!checked) {
      cloneColumns.value = showColumns.value.filter(
        (item) => item.dataIndex !== column.dataIndex
      );
    } else {
      cloneColumns.value.splice(index, 0, column);
    }
  };

  const exchangeArray = <T extends Array<any>>(
    array: T,
    beforeIdx: number,
    newIdx: number,
    isDeep = false
  ): T => {
    const newArray = isDeep ? cloneDeep(array) : array;
    if (beforeIdx > -1 && newIdx > -1) {
      newArray.splice(
        beforeIdx,
        1,
        newArray.splice(newIdx, 1, newArray[beforeIdx]).pop()
      );
    }
    return newArray;
  };

  const popupVisibleChange = (val: boolean) => {
    if (val) {
      nextTick(() => {
        const el = document.getElementById('tableSetting') as HTMLElement;
        const sortable = new Sortable(el, {
          onEnd(e: any) {
            const { oldIndex, newIndex } = e;
            exchangeArray(cloneColumns.value, oldIndex, newIndex);
            exchangeArray(showColumns.value, oldIndex, newIndex);
          },
        });
      });
    }
  };

  watch(
    () => columns.value,
    (val) => {
      cloneColumns.value = cloneDeep(val);
      cloneColumns.value.forEach((item, index) => {
        item.checked = true;
      });
      showColumns.value = cloneDeep(cloneColumns.value);
    },
    { deep: true, immediate: true }
  );
</script>

<script lang="ts">
  export default {
    name: 'UserList',
  };
</script>

<style scoped lang="less">
  :deep(.arco-table-th) {
    &:last-child {
      .arco-table-th-item-title {
        margin-left: 16px;
      }
    }
  }

  .action-icon {
    margin-left: 12px;
    cursor: pointer;
  }

  .active {
    color: #0960bd;
    background-color: #e3f4fc;
  }

  .setting {
    display: flex;
    align-items: center;
    width: 200px;

    .title {
      margin-left: 12px;
      cursor: pointer;
    }
  }

  .password-hint {
    display: block;
    margin-top: -8px;
    margin-bottom: 8px;
    font-size: 12px;
  }
</style>
