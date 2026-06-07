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
      <a-alert class="role-page-tip" type="info" show-icon>
        角色编码 <strong>super_admin</strong> 为超级管理员，默认拥有全部菜单权限（含后续新增菜单），无需手动分配。
      </a-alert>
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
          <a-space>
            <a-tooltip content="分配菜单">
              <a-button
                type="text"
                size="small"
                @click="handleAssignMenu(record)"
              >
                <template #icon>
                  <icon-menu />
                </template>
              </a-button>
            </a-tooltip>
            <a-tooltip content="编辑">
              <a-button type="text" size="small" @click="handleEdit(record)">
                <template #icon>
                  <icon-edit />
                </template>
              </a-button>
            </a-tooltip>
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
          </a-space>
        </template>
      </a-table>
    </a-card>
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑角色' : '创建角色'"
      unmount-on-close
      @close="resetRoleForm"
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
          <template #extra>
            请勿随意使用 super_admin，该编码为超级管理员专用。
          </template>
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
    <a-modal
      v-model:visible="menuModalVisible"
      title="分配菜单"
      :width="520"
      unmount-on-close
      :mask-closable="true"
      :esc-to-close="true"
      @cancel="handleMenuCancel"
      @close="handleMenuCancel"
      @before-ok="handleMenuBeforeOk"
    >
      <div class="menu-assign-body">
        <a-alert
          v-if="isSuperAdminRole"
          type="info"
          show-icon
          class="menu-assign-tip"
        >
          超级管理员（super_admin）默认拥有全部菜单权限，含后续新增菜单，无需手动分配。
        </a-alert>
        <div v-if="menuTreeLoading" class="menu-assign-loading">
          <icon-loading spin />
          <span>加载中...</span>
        </div>
        <template v-else-if="menuTreeNodes.length">
          <div class="menu-assign-toolbar">
            <a-checkbox v-model="menuCheckLinked">父子关联</a-checkbox>
          </div>
          <a-tree
            :key="menuTreeRenderKey"
            v-model:checked-keys="menuForm.menuIds"
            :data="menuTreeNodes"
            checkable
            :check-strictly="!menuCheckLinked"
            :disabled="isSuperAdminRole"
            checked-strategy="all"
            default-expand-all
            block-node
          />
        </template>
        <a-empty v-else description="暂无菜单" />
      </div>
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
    assignRoleMenus,
    QueryRolePageRequest,
    RoleDto,
    CreateRoleRequest,
    UpdateRoleRequest,
  } from '@/api/server/role';
  import { queryMenus, MenuDto } from '@/api/server/menu';
  import {
    toMenuTreeNodes,
    normalizeCheckedMenuIds,
    collectMenuIdsForSave,
    collectAllMenuIds,
  } from '@/utils/menu-tree';

  const SUPER_ADMIN_ROLE_CODE = 'super_admin';
  import { clearFormValidate } from '@/utils/form';
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
      width: 180,
    },
  ]);
  const menuModalVisible = ref(false);
  const menuTreeLoading = ref(false);
  const currentRoleCode = ref('');
  const isSuperAdminRole = computed(
    () => currentRoleCode.value.toLowerCase() === SUPER_ADMIN_ROLE_CODE
  );
  const menuTreeData = ref<MenuDto[]>([]);
  const menuTreeNodes = computed(() => toMenuTreeNodes(menuTreeData.value));
  const menuCheckLinked = ref(false);
  const menuTreeRenderKey = ref(0);
  const currentRoleId = ref<number | null>(null);
  let menuLoadToken = 0;
  const menuForm = reactive({
    menuIds: [] as number[],
  });

  const applyMenuCheckedIds = (menuIds: number[]) => {
    const normalized = menuCheckLinked.value
      ? normalizeCheckedMenuIds(menuTreeData.value, menuIds)
      : menuIds.map((id) => Number(id));
    menuForm.menuIds = normalized;
  };

  watch(menuCheckLinked, () => {
    menuTreeRenderKey.value += 1;
    if (menuForm.menuIds.length) {
      applyMenuCheckedIds(menuForm.menuIds);
    }
  });
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

  const resetRoleForm = () => {
    isEdit.value = false;
    currentEditId.value = null;
    operationForm.code = '';
    operationForm.name = '';
    operationForm.description = '';
    operationForm.isEnabled = true;
    clearFormValidate(operationFormRef.value);
  };

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
  const handleAdd = () => {
    resetRoleForm();
    modalVisible.value = true;
  };
  const handleEdit = (record: RoleDto) => {
    isEdit.value = true;
    currentEditId.value = record.id;
    operationForm.name = record.name;
    operationForm.description = record.description || '';
    operationForm.isEnabled = record.isEnabled;
    modalVisible.value = true;
    clearFormValidate(operationFormRef.value);
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

  const resetMenuModalState = () => {
    menuTreeLoading.value = false;
    menuForm.menuIds = [];
    currentRoleId.value = null;
    currentRoleCode.value = '';
    menuCheckLinked.value = true;
  };

  const resolveRoleMenuIds = (record: RoleDto) => {
    if (record.code?.toLowerCase() === SUPER_ADMIN_ROLE_CODE) {
      return collectAllMenuIds(menuTreeData.value);
    }
    return (record.menuIds || []).map((id) => Number(id));
  };

  const handleAssignMenu = async (record: RoleDto) => {
    const token = (menuLoadToken += 1);
    currentRoleId.value = record.id;
    currentRoleCode.value = record.code || '';
    menuModalVisible.value = true;

    if (menuTreeData.value.length) {
      applyMenuCheckedIds(resolveRoleMenuIds(record));
      menuTreeLoading.value = false;
      return;
    }

    menuTreeLoading.value = true;
    try {
      const { data } = await queryMenus();
      if (token !== menuLoadToken) {
        return;
      }
      menuTreeData.value = Array.isArray(data) ? data : [];
      await nextTick();
      applyMenuCheckedIds(resolveRoleMenuIds(record));
    } catch {
      if (token !== menuLoadToken) {
        return;
      }
      Message.warning('菜单树加载失败');
    } finally {
      if (token === menuLoadToken) {
        menuTreeLoading.value = false;
      }
    }
  };

  const handleMenuCancel = () => {
    menuLoadToken += 1;
    menuModalVisible.value = false;
    resetMenuModalState();
  };

  watch(menuModalVisible, (visible) => {
    if (!visible) {
      menuLoadToken += 1;
      menuTreeLoading.value = false;
    }
  });

  const handleMenuBeforeOk = async (done: (closed: boolean) => void) => {
    if (menuTreeLoading.value) {
      done(false);
      return;
    }
    if (!currentRoleId.value) {
      done(false);
      return;
    }
    if (isSuperAdminRole.value) {
      done(true);
      handleMenuCancel();
      return;
    }
    try {
      const menuIds = collectMenuIdsForSave(
        menuTreeData.value,
        menuForm.menuIds,
        menuCheckLinked.value
      );
      await assignRoleMenus(currentRoleId.value, menuIds);
      Message.success('菜单分配成功');
      done(true);
      handleMenuCancel();
      fetchData();
    } catch {
      done(false);
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

  .role-page-tip {
    margin-bottom: 16px;
  }

  .menu-assign-tip {
    margin-bottom: 12px;
  }

  .menu-assign-body {
    min-height: 280px;
    max-height: 420px;
    overflow-y: auto;
  }

  .menu-assign-toolbar {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border-2);
  }

  .menu-assign-loading {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    min-height: 280px;
    color: var(--color-text-3);
    font-size: 14px;
  }
</style>
