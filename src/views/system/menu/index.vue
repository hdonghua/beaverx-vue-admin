<template>
  <PageContainer>
    <QueryTable
      title="菜单列表"
      row-key="id"
      :loading="loading"
      :columns="columns"
      :data="renderData"
      :pagination="false"
      :bordered="false"
      :default-expand-all-rows="true"
      :show-search="false"
      :show-refresh="false"
      :show-density="false"
      :show-column-setting="false"
    >
      <template #toolbar-left>
        <a-button
          type="primary"
          v-permission="[Permissions.System.Menu.Create]"
          @click="handleAdd(null)"
        >
          <template #icon>
            <icon-plus />
          </template>
          新增
        </a-button>
      </template>
      <template #index="{ rowIndex }">
        {{ rowIndex + 1 }}
      </template>
      <template #name="{ record }">
        <span class="menu-name-cell">
          <span class="menu-name-text">{{ record.name }}</span>
          <a-tooltip
            v-if="showMenuVisibilityIcon(record)"
            :content="record.isVisible ? '菜单显示' : '菜单隐藏'"
          >
            <icon-eye-invisible
              v-if="!record.isVisible"
              class="menu-visibility-icon hidden"
            />
          </a-tooltip>
        </span>
      </template>
      <template #menuType="{ record }">
        <a-space>
          <DictTag
            :type-code="DictTypeCodes.SysMenuType"
            :value="record.menuType"
            plain
          />
          <a-tag v-if="record.isExternal" size="small" color="arcoblue">
            外链
          </a-tag>
        </a-space>
      </template>
      <template #icon="{ record }">
        <div class="menu-icon-cell">
          <IconSelector
            v-if="record.icon"
            :model-value="record.icon"
            readonly
          />
          <span v-else class="menu-icon-empty">-</span>
        </div>
      </template>
      <template #isVisible="{ record }">
        {{ record.isVisible ? '是' : '否' }}
      </template>
      <template #isEnabled="{ record }">
        <a-tag :color="record.isEnabled ? 'green' : 'red'">
          {{ record.isEnabled ? '启用' : '禁用' }}
        </a-tag>
      </template>
      <template #operations="{ record }">
        <a-button
          v-if="record.menuType !== MenuType.Button"
          type="text"
          size="small"
          v-permission="[Permissions.System.Menu.Create]"
          @click="handleAdd(record)"
        >
          <template #icon>
            <icon-plus />
          </template>
        </a-button>
        <a-button
          type="text"
          size="small"
          v-permission="[Permissions.System.Menu.Update]"
          @click="handleEdit(record)"
        >
          <template #icon>
            <icon-edit />
          </template>
        </a-button>
        <a-popconfirm
          content="确定要删除该菜单吗？"
          @ok="handleDelete(record.id)"
        >
          <a-button
            type="text"
            size="small"
            status="danger"
            v-permission="[Permissions.System.Menu.Delete]"
          >
            <template #icon>
              <icon-delete />
            </template>
          </a-button>
        </a-popconfirm>
      </template>
    </QueryTable>
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑菜单' : '创建菜单'"
      :width="720"
      unmount-on-close
      @close="resetForm"
      @before-ok="handleBeforeOk"
    >
      <a-form
        ref="operationFormRef"
        layout="horizontal"
        :model="operationForm"
        :label-col-props="{ span: 8 }"
        :wrapper-col-props="{ span: 16 }"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              field="name"
              label="菜单名称"
              :rules="[{ required: true, message: '菜单名称不能为空' }]"
            >
              <a-input v-model="operationForm.name" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              field="menuType"
              label="菜单类型"
              :rules="[{ required: true, message: '请选择菜单类型' }]"
            >
              <DictSelect
                v-model="operationForm.menuType"
                :type-code="DictTypeCodes.SysMenuType"
                value-type="number"
                @change="handleMenuTypeChange"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="showExternalSwitch" :span="12">
            <a-form-item field="isExternal" label="是否外链">
              <a-switch
                v-model="operationForm.isExternal"
                @change="handleExternalChange"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="showPath" :span="12">
            <a-form-item
              field="path"
              :label="operationForm.isExternal ? '外链地址' : '路由路径'"
              :rules="pathRules"
            >
              <a-input
                v-model="operationForm.path"
                :placeholder="
                  operationForm.isExternal
                    ? 'https://www.example.com'
                    : '/system/user'
                "
              />
            </a-form-item>
          </a-col>
          <a-col v-if="showComponent" :span="12">
            <a-form-item field="component" label="组件路径">
              <a-input
                v-model="operationForm.component"
                placeholder="system/user/index"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="showPerms" :span="12">
            <a-form-item field="perms" label="权限标识" :rules="permsRules">
              <a-input
                v-model="operationForm.perms"
                placeholder="system:user:list"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="showIcon" :span="12">
            <a-form-item field="icon" label="图标">
              <IconSelector v-model="operationForm.icon" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="sort" label="排序">
              <a-input-number
                v-model="operationForm.sort"
                :min="0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="showVisible" :span="12">
            <a-form-item field="isVisible" label="是否显示">
              <a-switch v-model="operationForm.isVisible" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="isEnabled" label="是否启用">
              <a-switch v-model="operationForm.isEnabled" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive } from 'vue';
  import useLoading from '@/hooks/loading';
  import { Message } from '@arco-design/web-vue';
  import QueryTable from '@/components/common/QueryTable.vue';
  import {
    queryMenus,
    addMenu,
    updateMenu,
    deleteMenu,
    MenuDto,
    CreateMenuRequest,
    UpdateMenuRequest,
    MenuType,
  } from '@/api/server/rbac/menu';
  import { DictTypeCodes } from '@/constants/dict-types';
  import DictSelect from '@/components/dict-select/index.vue';
  import DictTag from '@/components/dict-tag/index.vue';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import { FormInstance } from '@arco-design/web-vue/es/form';
  import IconSelector from '@/components/icon-selector/index.vue';
  import { clearFormValidate } from '@/utils/form';
  import { regexUrl } from '@/utils';
  import { Permissions } from '@/constants/permissions';
  import type { EntityId } from '@/types/entity-id';

  const showMenuVisibilityIcon = (record: MenuDto) =>
    record.menuType === MenuType.Directory ||
    record.menuType === MenuType.Menu;

  const { loading, setLoading } = useLoading(true);
  const renderData = ref<MenuDto[]>([]);

  const columns = computed<TableColumnData[]>(() => [
    {
      title: '序号',
      dataIndex: 'index',
      slotName: 'index',
      width: 80,
    },
    {
      title: '菜单名称',
      dataIndex: 'name',
      slotName: 'name',
    },
    {
      title: '类型',
      dataIndex: 'menuType',
      slotName: 'menuType',
      width: 120,
    },
    {
      title: '路径',
      dataIndex: 'path',
    },
    {
      title: '权限标识',
      dataIndex: 'perms',
    },
    {
      title: '图标',
      dataIndex: 'icon',
      slotName: 'icon',
      width: 80,
      align: 'center',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
    },
    {
      title: '显示',
      dataIndex: 'isVisible',
      slotName: 'isVisible',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      slotName: 'isEnabled',
      width: 90,
    },
    {
      title: '操作',
      dataIndex: 'operations',
      slotName: 'operations',
      width: 180,
    },
  ]);

  const operationFormRef = ref<FormInstance>();
  const modalVisible = ref(false);
  const isEdit = ref(false);
  const currentEditId = ref<EntityId | null>(null);
  const operationForm = reactive<CreateMenuRequest>({
    parentId: null,
    name: '',
    menuType: MenuType.Menu,
    path: '',
    component: '',
    perms: '',
    icon: '',
    sort: 0,
    isVisible: true,
    isEnabled: true,
    isExternal: false,
  });

  const showPath = computed(
    () =>
      operationForm.menuType === MenuType.Directory ||
      operationForm.menuType === MenuType.Menu
  );
  const showExternalSwitch = computed(
    () => operationForm.menuType === MenuType.Menu
  );
  const showComponent = computed(
    () =>
      operationForm.menuType === MenuType.Menu && !operationForm.isExternal
  );
  const showPerms = computed(
    () =>
      operationForm.menuType === MenuType.Menu ||
      operationForm.menuType === MenuType.Button
  );
  const showIcon = computed(
    () =>
      operationForm.menuType === MenuType.Directory ||
      operationForm.menuType === MenuType.Menu
  );
  const showVisible = computed(
    () => operationForm.menuType !== MenuType.Button
  );

  const pathRules = computed(() => {
    if (operationForm.menuType !== MenuType.Menu) {
      return [];
    }
    if (operationForm.isExternal) {
      return [
        { required: true, message: '外链地址不能为空' },
        {
          validator: (value: string, callback: (error?: string) => void) => {
            if (!value || regexUrl.test(value.trim())) {
              callback();
              return;
            }
            callback('请输入有效的 http/https 外链地址');
          },
        },
      ];
    }
    return [{ required: true, message: '路由路径不能为空' }];
  });
  const permsRules = computed(() =>
    operationForm.menuType === MenuType.Button
      ? [{ required: true, message: '权限标识不能为空' }]
      : []
  );

  const isExternalUrl = (value?: string) =>
    Boolean(value?.trim() && regexUrl.test(value.trim()));

  const syncFieldsForMenuType = () => {
    const { menuType } = operationForm;

    if (menuType !== MenuType.Menu) {
      operationForm.isExternal = false;
    }

    if (menuType === MenuType.Button) {
      operationForm.path = '';
      operationForm.component = '';
      operationForm.icon = '';
      operationForm.isVisible = false;
    } else if (menuType === MenuType.Directory) {
      operationForm.component = '';
      operationForm.perms = '';
      if (isExternalUrl(operationForm.path)) {
        operationForm.path = '';
      }
    } else if (operationForm.isExternal) {
      operationForm.component = '';
    } else if (isExternalUrl(operationForm.path)) {
      operationForm.path = '';
    }

    if (!showPerms.value) operationForm.perms = '';
    if (!showIcon.value) operationForm.icon = '';
    if (!showVisible.value) operationForm.isVisible = false;
  };

  const handleMenuTypeChange = () => {
    syncFieldsForMenuType();
    operationFormRef.value?.clearValidate();
  };

  const handleExternalChange = (value: boolean | string | number) => {
    if (value) {
      operationForm.component = '';
    } else if (isExternalUrl(operationForm.path)) {
      operationForm.path = '';
    }
    operationFormRef.value?.clearValidate();
  };

  const buildSubmitPayload = (): CreateMenuRequest => {
    const payload: CreateMenuRequest = {
      parentId: operationForm.parentId,
      name: operationForm.name,
      menuType: operationForm.menuType,
      sort: operationForm.sort,
      isEnabled: operationForm.isEnabled,
      path: showPath.value ? operationForm.path || '' : '',
      component: showComponent.value ? operationForm.component || '' : '',
      perms: showPerms.value ? operationForm.perms || '' : '',
      icon: showIcon.value ? operationForm.icon || '' : '',
      isVisible: showVisible.value ? operationForm.isVisible : false,
      isExternal: showExternalSwitch.value ? operationForm.isExternal : false,
    };
    return payload;
  };

  const handleBeforeOk = async (done: (closed: boolean) => void) => {
    const validErr = await operationFormRef.value?.validate();
    if (!validErr) {
      try {
        const payload = buildSubmitPayload();
        if (isEdit.value && currentEditId.value) {
          const req: UpdateMenuRequest = {
            id: currentEditId.value,
            ...payload,
          };
          await updateMenu(req);
          Message.success('更新成功');
        } else {
          await addMenu(payload);
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

  const resetForm = () => {
    isEdit.value = false;
    currentEditId.value = null;
    operationForm.parentId = null;
    operationForm.name = '';
    operationForm.menuType = MenuType.Menu;
    operationForm.path = '';
    operationForm.component = '';
    operationForm.perms = '';
    operationForm.icon = '';
    operationForm.sort = 0;
    operationForm.isVisible = true;
    operationForm.isEnabled = true;
    operationForm.isExternal = false;
    clearFormValidate(operationFormRef.value);
  };

  const handleAdd = (record?: MenuDto | null) => {
    resetForm();
    if (record) {
      operationForm.parentId = record.id;
      operationForm.menuType =
        record.menuType === MenuType.Directory
          ? MenuType.Menu
          : MenuType.Button;
    }
    modalVisible.value = true;
  };

  const handleEdit = (record: MenuDto) => {
    isEdit.value = true;
    currentEditId.value = record.id;
    operationForm.parentId = record.parentId ?? null;
    operationForm.name = record.name;
    operationForm.menuType = record.menuType;
    operationForm.path = record.path || '';
    operationForm.component = record.component || '';
    operationForm.perms = record.perms || '';
    operationForm.icon = record.icon || '';
    operationForm.sort = record.sort;
    operationForm.isVisible = record.isVisible;
    operationForm.isEnabled = record.isEnabled;
    operationForm.isExternal = record.isExternal;
    modalVisible.value = true;
    clearFormValidate(operationFormRef.value);
  };

  const handleDelete = async (id: EntityId) => {
    try {
      await deleteMenu(id);
      Message.success('删除成功');
      fetchData();
    } catch {
      // error handled by interceptor
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await queryMenus();
      renderData.value = normalizeMenuTree(data || []);
    } catch (err) {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  /** 兼容 menuType=0（目录）在序列化/渲染中被当作空值的情况 */
  const normalizeMenuTree = (menus: MenuDto[]): MenuDto[] =>
    menus.map((menu) => ({
      ...menu,
      menuType:
        menu.menuType === undefined || menu.menuType === null
          ? MenuType.Directory
          : Number(menu.menuType),
      children: menu.children?.length
        ? normalizeMenuTree(menu.children)
        : menu.children,
    }));

  fetchData();
</script>

<script lang="ts">
  export default {
    name: 'MenuList',
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

  .menu-name-cell {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
  }

  .menu-name-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .menu-visibility-icon {
    flex-shrink: 0;
    font-size: 14px;
    color: rgb(var(--primary-6));

    &.hidden {
      color: var(--color-text-3);
    }
  }

  .menu-icon-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .menu-icon-empty {
    color: var(--color-text-4);
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
