<template>
  <PageContainer :breadcrumb="['menu.system', 'menu.system.configList']">
    <a-row :gutter="16">
      <a-col :span="6">
        <a-card class="general-card" title="配置分组">
          <a-menu
            :selected-keys="[selectedGroupKey]"
            @menu-item-click="handleGroupClick"
          >
            <a-menu-item key="__all__">全部</a-menu-item>
            <a-menu-item v-for="group in groupList" :key="group">
              {{ group }}
            </a-menu-item>
          </a-menu>
        </a-card>
      </a-col>
      <a-col :span="18">
        <a-card class="general-card" title="配置列表">
          <a-form :model="query" layout="inline" class="config-search">
            <a-form-item field="keyword">
              <a-input
                v-model="query.keyword"
                allow-clear
                placeholder="键/标签/值"
              />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="search">
                  <template #icon><icon-search /></template>
                  查询
                </a-button>
                <a-button @click="resetQuery">
                  <template #icon><icon-refresh /></template>
                  重置
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
          <div class="config-toolbar">
            <a-button
              type="primary"
              v-permission="[Permissions.System.Config.Create]"
              @click="handleAdd"
            >
              <template #icon><icon-plus /></template>
              新增配置
            </a-button>
          </div>
          <a-table
            row-key="id"
            :loading="loading"
            :pagination="pagination"
            :columns="columns"
            :data="list"
            @page-change="onPageChange"
            column-resizable
            :bordered="{cell:true}"
          >
            <template #group="{ record }">
              {{ record.group || '未分组' }}
            </template>
            <template #value="{ record }">
              {{ record.value }}
            </template>
            <template #isEnabled="{ record }">
              <a-tag :color="record.isEnabled ? 'green' : 'red'">
                {{ record.isEnabled ? '启用' : '禁用' }}
              </a-tag>
            </template>
            <template #operations="{ record }">
              <a-space>
                <a-button
                  type="text"
                  size="small"
                  v-permission="[Permissions.System.Config.Update]"
                  @click="handleEdit(record)"
                >
                  <template #icon><icon-edit /></template>
                </a-button>
                <a-popconfirm
                  content="确定删除该配置吗？"
                  @ok="handleDelete(record.id)"
                >
                  <a-button
                    type="text"
                    size="small"
                    status="danger"
                    v-permission="[Permissions.System.Config.Delete]"
                  >
                    <template #icon><icon-delete /></template>
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑配置' : '新增配置'"
      unmount-on-close
      @close="resetForm"
      @before-ok="handleBeforeOk"
    >
      <a-form ref="formRef" layout="vertical" :model="form">
        <a-form-item
          v-if="!isEdit"
          field="key"
          label="配置键"
          :rules="[{ required: true, message: '配置键不能为空' }]"
        >
          <a-input v-model="form.key" placeholder="如 sys.site.name" />
        </a-form-item>
        <a-form-item
          field="label"
          label="配置标签"
          :rules="[{ required: true, message: '配置标签不能为空' }]"
        >
          <a-input v-model="form.label" />
        </a-form-item>
        <a-form-item
          field="value"
          label="配置值"
          :rules="[{ required: true, message: '配置值不能为空' }]"
        >
          <a-textarea v-model="form.value" :auto-size="{ minRows: 2, maxRows: 6 }" />
        </a-form-item>
        <a-form-item field="group" label="配置分组">
          <a-auto-complete
            v-model="form.group"
            :data="groupList"
            allow-clear
            placeholder="可选，如 系统、安全"
          />
        </a-form-item>
        <a-form-item field="sort" label="排序">
          <a-input-number v-model="form.sort" :min="0" />
        </a-form-item>
        <a-form-item field="remark" label="备注">
          <a-input v-model="form.remark" />
        </a-form-item>
        <a-form-item v-if="isEdit" field="isEnabled" label="是否启用">
          <a-switch v-model="form.isEnabled" />
        </a-form-item>
      </a-form>
    </a-modal>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import type { FormInstance } from '@arco-design/web-vue/es/form';
  import useLoading from '@/hooks/loading';
  import { clearFormValidate } from '@/utils/form';
  import {
    queryConfigPage,
    queryConfigGroups,
    addConfig,
    updateConfig,
    deleteConfig,
    ConfigDto,
  } from '@/api/server/system/config';
  import { Permissions } from '@/constants/permissions';
  import type { EntityId } from '@/types/entity-id';

  defineOptions({ name: 'ConfigList' });

  const { loading, setLoading } = useLoading(true);

  const list = ref<ConfigDto[]>([]);
  const groupList = ref<string[]>([]);
  const selectedGroupKey = ref('__all__');

  const query = reactive({
    keyword: '',
  });

  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const columns: TableColumnData[] = [
    { title: '配置键', dataIndex: 'key', ellipsis: true, tooltip: true, width: 180 },
    { title: '标签', dataIndex: 'label', ellipsis: true, tooltip: true, width: 140 },
    { title: '配置值', dataIndex: 'value', slotName: 'value' },
    { title: '分组', dataIndex: 'group', slotName: 'group', width: 100 },
    { title: '排序', dataIndex: 'sort', width: 70 },
    { title: '状态', dataIndex: 'isEnabled', slotName: 'isEnabled', width: 80 },
    { title: '操作', slotName: 'operations', width: 90 },
  ];

  const modalVisible = ref(false);
  const isEdit = ref(false);
  const editingId = ref<EntityId | null>(null);
  const formRef = ref<FormInstance>();
  const form = reactive({
    key: '',
    label: '',
    value: '',
    group: '',
    remark: '',
    sort: 0,
    isEnabled: true,
  });

  const resolveGroupParam = () => {
    if (selectedGroupKey.value === '__all__') {
      return '';
    }
    return selectedGroupKey.value;
  };

  const fetchGroups = async () => {
    const { data } = await queryConfigGroups();
    groupList.value = data;
  };

  const fetchList = async () => {
    setLoading(true);
    try {
      const { data } = await queryConfigPage({
        current: pagination.current,
        pageSize: pagination.pageSize,
        keyword: query.keyword || undefined,
        group: resolveGroupParam(),
      });
      list.value = data.items;
      pagination.total = data.total;
    } finally {
      setLoading(false);
    }
  };

  const search = () => {
    pagination.current = 1;
    fetchList();
  };

  const resetQuery = () => {
    query.keyword = '';
    search();
  };

  const onPageChange = (page: number) => {
    pagination.current = page;
    fetchList();
  };

  const handleGroupClick = (key: string) => {
    selectedGroupKey.value = key;
    pagination.current = 1;
    fetchList();
  };

  const resetForm = () => {
    form.key = '';
    form.label = '';
    form.value = '';
    form.group = '';
    form.remark = '';
    form.sort = 0;
    form.isEnabled = true;
    editingId.value = null;
    clearFormValidate(formRef.value);
  };

  const handleAdd = () => {
    isEdit.value = false;
    resetForm();
    if (selectedGroupKey.value !== '__all__' && selectedGroupKey.value !== '__ungrouped__') {
      form.group = selectedGroupKey.value;
    }
    modalVisible.value = true;
  };

  const handleEdit = (record: ConfigDto) => {
    isEdit.value = true;
    editingId.value = record.id;
    form.key = record.key;
    form.label = record.label;
    form.value = record.value;
    form.group = record.group || '';
    form.remark = record.remark || '';
    form.sort = record.sort;
    form.isEnabled = record.isEnabled;
    modalVisible.value = true;
  };

  const handleBeforeOk = async () => {
    const errors = await formRef.value?.validate();
    if (errors) {
      return false;
    }

    try {
      if (isEdit.value && editingId.value != null) {
        await updateConfig({
          id: editingId.value,
          label: form.label,
          value: form.value,
          group: form.group,
          remark: form.remark,
          sort: form.sort,
          isEnabled: form.isEnabled,
        });
        Message.success('更新成功');
      } else {
        await addConfig({
          key: form.key,
          label: form.label,
          value: form.value,
          group: form.group || undefined,
          remark: form.remark || undefined,
          sort: form.sort,
          isEnabled: form.isEnabled,
        });
        Message.success('创建成功');
      }
      await fetchGroups();
      await fetchList();
      return true;
    } catch {
      return false;
    }
  };

  const handleDelete = async (id: EntityId) => {
    await deleteConfig(id);
    Message.success('删除成功');
    await fetchGroups();
    await fetchList();
  };

  onMounted(async () => {
    await fetchGroups();
    await fetchList();
  });
</script>

<style scoped lang="less">
  .config-search {
    margin-bottom: 12px;
  }

  .config-toolbar {
    margin-bottom: 12px;
  }
</style>
