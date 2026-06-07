<template>
  <div class="container">
    <Breadcrumb :items="['menu.system', 'menu.system.menuList']" />
    <a-card class="general-card" :title="$t('menu.system.menuList')">
      <a-row style="margin-bottom: 16px">
        <a-col :span="24">
          <a-space>
            <a-button type="primary" @click="handleAdd(null)">
              <template #icon>
                <icon-plus />
              </template>
              {{ $t('searchTable.operation.create') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-table
        :loading="loading"
        :columns="columns"
        :data="renderData"
        :bordered="false"
        :size="size"
        :pagination="false"
        :default-expand-all-rows="true"
        row-key="id"
      >
        <template #index="{ rowIndex }">
          {{ rowIndex + 1 }}
        </template>
        <template #menuType="{ record }">
          {{ menuTypeLabel(record.menuType) }}
        </template>
        <template #icon="{ record }">
          <IconSelector :model-value="record.icon" readonly />
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
            @click="handleAdd(record)"
          >
            <template #icon>
              <icon-plus />
            </template>
          </a-button>
          <a-button type="text" size="small" @click="handleEdit(record)">
            <template #icon>
              <icon-edit />
            </template>
          </a-button>
          <a-popconfirm
            content="确定要删除该菜单吗？"
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
      :title="isEdit ? '编辑菜单' : '创建菜单'"
      :width="720"
      @cancel="handleCancel"
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
              <a-select
                v-model="operationForm.menuType"
                :options="menuTypeOptions"
                @change="handleMenuTypeChange"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="showPath" :span="12">
            <a-form-item
              field="path"
              label="路由路径"
              :rules="pathRules"
            >
              <a-input
                v-model="operationForm.path"
                placeholder="/system/user"
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
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import { Message } from '@arco-design/web-vue';
  import {
    queryMenus,
    addMenu,
    updateMenu,
    deleteMenu,
    MenuDto,
    CreateMenuRequest,
    UpdateMenuRequest,
    MenuType,
  } from '@/api/server/menu';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import { FormInstance } from '@arco-design/web-vue/es/form';
  import IconSelector from '@/components/icon-selector/index.vue';

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';

  const menuTypeOptions = [
    { label: '目录', value: MenuType.Directory },
    { label: '菜单', value: MenuType.Menu },
    { label: '按钮', value: MenuType.Button },
  ];

  const menuTypeLabel = (type: MenuType) => {
    const item = menuTypeOptions.find((opt) => opt.value === type);
    return item?.label || '-';
  };

  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref<MenuDto[]>([]);
  const size = ref<SizeProps>('medium');

  const columns = computed<TableColumnData[]>(() => [
    {
      title: t('searchTable.columns.index'),
      dataIndex: 'index',
      slotName: 'index',
      width: 80,
    },
    {
      title: '菜单名称',
      dataIndex: 'name',
    },
    {
      title: '类型',
      dataIndex: 'menuType',
      slotName: 'menuType',
      width: 90,
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
      width: 100,
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
      title: t('searchTable.columns.operations'),
      dataIndex: 'operations',
      slotName: 'operations',
      width: 180,
    },
  ]);

  const operationFormRef = ref<FormInstance>();
  const modalVisible = ref(false);
  const isEdit = ref(false);
  const currentEditId = ref<number | null>(null);
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
  });

  const showPath = computed(
    () =>
      operationForm.menuType === MenuType.Directory ||
      operationForm.menuType === MenuType.Menu
  );
  const showComponent = computed(
    () => operationForm.menuType === MenuType.Menu
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

  const pathRules = computed(() =>
    operationForm.menuType === MenuType.Menu
      ? [{ required: true, message: '路由路径不能为空' }]
      : []
  );
  const permsRules = computed(() =>
    operationForm.menuType === MenuType.Button
      ? [{ required: true, message: '权限标识不能为空' }]
      : []
  );

  const clearHiddenFields = () => {
    if (!showPath.value) operationForm.path = '';
    if (!showComponent.value) operationForm.component = '';
    if (!showPerms.value) operationForm.perms = '';
    if (!showIcon.value) operationForm.icon = '';
    if (!showVisible.value) operationForm.isVisible = false;
  };

  const handleMenuTypeChange = () => {
    clearHiddenFields();
    operationFormRef.value?.clearValidate();
  };

  const buildSubmitPayload = (): CreateMenuRequest => {
    const payload: CreateMenuRequest = {
      parentId: operationForm.parentId,
      name: operationForm.name,
      menuType: operationForm.menuType,
      sort: operationForm.sort,
      isEnabled: operationForm.isEnabled,
    };
    if (showPath.value && operationForm.path) {
      payload.path = operationForm.path;
    }
    if (showComponent.value && operationForm.component) {
      payload.component = operationForm.component;
    }
    if (showPerms.value && operationForm.perms) {
      payload.perms = operationForm.perms;
    }
    if (showIcon.value && operationForm.icon) {
      payload.icon = operationForm.icon;
    }
    if (showVisible.value) {
      payload.isVisible = operationForm.isVisible;
    }
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

  const handleCancel = () => {
    modalVisible.value = false;
    resetForm();
  };

  const resetForm = () => {
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
  };

  const handleAdd = (record?: MenuDto | null) => {
    isEdit.value = false;
    currentEditId.value = null;
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
    modalVisible.value = true;
  };

  const handleDelete = async (id: number) => {
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
      renderData.value = data || [];
    } catch (err) {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  fetchData();
</script>

<script lang="ts">
  export default {
    name: 'MenuList',
  };
</script>

<style scoped lang="less">
  .container {
    padding: 0 20px 20px 20px;
  }

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
