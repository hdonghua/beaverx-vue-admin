<template>
  <PageContainer :breadcrumb="['menu.system', 'menu.system.userList']">
    <a-card class="general-card">
      <a-row>
        <a-col :flex="1">
          <a-form
            :model="formModel"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="left"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item field="name" :label="$t('userList.userName')">
                  <a-input
                    v-model="formModel.userName"
                    :placeholder="$t('userList.userName.placeholder')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-space :size="18">
                  <a-button type="primary" @click="search">
                    <template #icon>
                      <icon-search />
                    </template>
                    {{ $t('searchTable.form.search') }}
                  </a-button>
                  <a-button @click="reset">
                    <template #icon>
                      <icon-refresh />
                    </template>
                    {{ $t('searchTable.form.reset') }}
                  </a-button>
                </a-space>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
      </a-row>
      <a-divider style="margin-top: 0" />
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button
              type="primary"
              v-permission="[Permissions.System.User.Create]"
              @click="handleAdd"
            >
              <template #icon>
                <icon-plus />
              </template>
              {{ $t('searchTable.operation.create') }}
            </a-button>
            <a-button @click="handleExport">
              <template #icon>
                <icon-download />
              </template>
              导出
            </a-button>
          </a-space>
        </a-col>
        <a-col
          :span="12"
          style="display: flex; align-items: center; justify-content: end"
        >
          <a-tooltip :content="$t('searchTable.actions.refresh')">
            <div class="action-icon" @click="search"
              ><icon-refresh size="18"
            /></div>
          </a-tooltip>
          <a-dropdown @select="handleSelectDensity">
            <a-tooltip :content="$t('searchTable.actions.density')">
              <div class="action-icon"><icon-line-height size="18" /></div>
            </a-tooltip>
            <template #content>
              <a-doption
                v-for="item in densityList"
                :key="item.value"
                :value="item.value"
                :class="{ active: item.value === size }"
              >
                <span>{{ item.name }}</span>
              </a-doption>
            </template>
          </a-dropdown>
          <a-tooltip :content="$t('searchTable.actions.columnSetting')">
            <a-popover
              trigger="click"
              position="bl"
              @popup-visible-change="popupVisibleChange"
            >
              <div class="action-icon"><icon-settings size="18" /></div>
              <template #content>
                <div id="tableSetting">
                  <div
                    v-for="(item, index) in showColumns"
                    :key="item.dataIndex"
                    class="setting"
                  >
                    <div style="margin-right: 4px; cursor: move">
                      <icon-drag-arrow />
                    </div>
                    <div>
                      <a-checkbox
                        v-model="item.checked"
                        @change="
                          handleChange($event, item as TableColumnData, index)
                        "
                      >
                      </a-checkbox>
                    </div>
                    <div class="title">
                      {{ item.title === '#' ? '序列号' : item.title }}
                    </div>
                  </div>
                </div>
              </template>
            </a-popover>
          </a-tooltip>
        </a-col>
      </a-row>
      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :columns="(cloneColumns as TableColumnData[])"
        :data="renderData"
        :bordered="false"
        :size="size"
        @page-change="onPageChange"
      >
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
      </a-table>
    </a-card>
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
          :rules="[{ required: true, message: '密码不能为空' }]"
        >
          <a-input-password v-model="operationForm.password" allow-clear />
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
          :rules="[{ required: true, message: '新密码不能为空' }]"
        >
          <a-input-password
            v-model="passwordForm.newPassword"
            allow-clear
            placeholder="请输入新密码"
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
      </a-form>
    </a-modal>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive, watch, nextTick } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Message } from '@arco-design/web-vue';
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

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };

  const generateFormModel = () => {
    return {
      userName: '',
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
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
      name: t('searchTable.size.mini'),
      value: 'mini',
    },
    {
      name: t('searchTable.size.small'),
      value: 'small',
    },
    {
      name: t('searchTable.size.medium'),
      value: 'medium',
    },
    {
      name: t('searchTable.size.large'),
      value: 'large',
    },
  ]);
  const columns = computed<TableColumnData[]>(() => [
    {
      title: t('searchTable.columns.index'),
      dataIndex: 'index',
      slotName: 'index',
    },
    {
      title: t('userList.userName'),
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
      title: t('searchTable.columns.operations'),
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
  const confirmPasswordRules = [
    { required: true, message: '请确认新密码' },
    {
      validator: (value: string, callback: (error?: string) => void) => {
        if (value !== passwordForm.newPassword) {
          callback('两次输入的密码不一致');
        } else {
          callback();
        }
      },
    },
  ];

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
</style>
