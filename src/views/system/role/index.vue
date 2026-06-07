<template>
  <PageContainer :breadcrumb="['menu.system', 'menu.system.roleList']">
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
                <a-form-item field="name" label="角色名称">
                  <a-input
                    v-model="formModel.name"
                    placeholder="请输入角色名称"
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
            <a-button type="primary" @click="handleAdd">
              <template #icon>
                <icon-plus />
              </template>
              {{ $t('searchTable.operation.create') }}
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
        <template #isEnabled="{ record }">
          <a-tag :color="record.isEnabled ? 'green' : 'red'">
            {{ record.isEnabled ? '启用' : '禁用' }}
          </a-tag>
        </template>
        <template #operations="{ record }">
          <a-button type="text" size="small" @click="handleEdit(record)">
            <template #icon>
              <icon-edit />
            </template>
          </a-button>
          <a-popconfirm
            content="确定要删除该角色吗？"
            @ok="handleDelete(record.id)"
          >
            <a-button type="text" size="small" status="danger">
              <template #icon>
                <icon-delete />
              </template>
            </a-button>
          </a-popconfirm>
        </template>
      </a-table>
    </a-card>
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑角色' : '创建角色'"
      @cancel="handleCancel"
      @before-ok="handleBeforeOk"
    >
      <a-form ref="operationFormRef" layout="vertical" :model="operationForm">
        <a-form-item
          v-if="!isEdit"
          field="code"
          label="角色编码"
          :rules="[{ required: true, message: '角色编码不能为空' }]"
        >
          <a-input v-model="operationForm.code" placeholder="如 editor" />
        </a-form-item>
        <a-form-item
          field="name"
          label="角色名称"
          :rules="[{ required: true, message: '角色名称不能为空' }]"
        >
          <a-input v-model="operationForm.name" />
        </a-form-item>
        <a-form-item field="description" label="角色描述">
          <a-input v-model="operationForm.description" />
        </a-form-item>
        <a-form-item v-if="isEdit" field="isEnabled" label="是否启用">
          <a-switch v-model="operationForm.isEnabled" />
        </a-form-item>
      </a-form>
    </a-modal>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive, watch, nextTick } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import { Message } from '@arco-design/web-vue';
  import {
    queryRolePage,
    addRole,
    updateRole,
    deleteRole,
    QueryRolePageRequest,
    RoleDto,
    CreateRoleRequest,
    UpdateRoleRequest,
  } from '@/api/server/role';
  import { Pagination } from '@/types/global';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import cloneDeep from 'lodash/cloneDeep';
  import Sortable from 'sortablejs';
  import { FormInstance } from '@arco-design/web-vue/es/form';

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };

  const generateFormModel = () => {
    return {
      name: '',
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref<RoleDto[]>([]);
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
      title: '角色编码',
      dataIndex: 'code',
    },
    {
      title: '角色名称',
      dataIndex: 'name',
    },
    {
      title: '角色描述',
      dataIndex: 'description',
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      slotName: 'isEnabled',
    },
    {
      title: t('searchTable.columns.operations'),
      dataIndex: 'operations',
      slotName: 'operations',
      width: 150,
    },
  ]);
  const operationFormRef = ref<FormInstance>();
  const modalVisible = ref(false);
  const isEdit = ref(false);
  const currentEditId = ref<number | null>(null);
  const operationForm = reactive<
    CreateRoleRequest & { isEnabled?: boolean }
  >({
    code: '',
    name: '',
    description: '',
    isEnabled: true,
  });

  const handleBeforeOk = async (done: (closed: boolean) => void) => {
    const validErr = await operationFormRef.value?.validate();
    if (!validErr) {
      try {
        if (isEdit.value && currentEditId.value) {
          const req: UpdateRoleRequest = {
            id: currentEditId.value,
            name: operationForm.name,
            description: operationForm.description,
            isEnabled: operationForm.isEnabled,
          };
          await updateRole(req);
          Message.success('更新成功');
        } else {
          await addRole({
            code: operationForm.code,
            name: operationForm.name,
            description: operationForm.description,
          });
          Message.success('创建成功');
        }
        done(true);
        fetchData();
      } catch {
        done(false);
      }
    } else {
      done(false);
    }
  };
  const handleCancel = () => {
    modalVisible.value = false;
    operationForm.code = '';
    operationForm.name = '';
    operationForm.description = '';
    operationForm.isEnabled = true;
  };
  const handleAdd = () => {
    isEdit.value = false;
    currentEditId.value = null;
    operationForm.code = '';
    operationForm.name = '';
    operationForm.description = '';
    operationForm.isEnabled = true;
    modalVisible.value = true;
  };
  const handleEdit = (record: RoleDto) => {
    isEdit.value = true;
    currentEditId.value = record.id;
    operationForm.name = record.name;
    operationForm.description = record.description || '';
    operationForm.isEnabled = record.isEnabled;
    modalVisible.value = true;
  };
  const handleDelete = async (id: number) => {
    try {
      await deleteRole(id);
      Message.success('删除成功');
      fetchData();
    } catch {
      // error
    }
  };

  const fetchData = async (
    params: QueryRolePageRequest = { current: 1, pageSize: 20 }
  ) => {
    setLoading(true);
    try {
      const { data } = await queryRolePage(params);
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
      cloneColumns.value.forEach((item) => {
        item.checked = true;
      });
      showColumns.value = cloneDeep(cloneColumns.value);
    },
    { deep: true, immediate: true }
  );
</script>

<script lang="ts">
  export default {
    name: 'RoleList',
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
