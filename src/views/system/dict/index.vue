<template>
  <PageContainer :breadcrumb="['menu.system', 'menu.system.dictList']">
    <a-row :gutter="16">
      <a-col :span="9">
        <a-card class="general-card" title="字典类型">
          <a-form :model="typeQuery" layout="inline" class="dict-search">
            <a-form-item field="keyword">
              <a-input
                v-model="typeQuery.keyword"
                allow-clear
                placeholder="编码/名称"
              />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="searchTypes">
                  <template #icon><icon-search /></template>
                  查询
                </a-button>
                <a-button @click="resetTypeQuery">
                  <template #icon><icon-refresh /></template>
                  重置
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
          <div class="dict-toolbar">
            <a-button type="primary" @click="handleAddType">
              <template #icon><icon-plus /></template>
              新增类型
            </a-button>
          </div>
          <a-table
            row-key="id"
            :loading="typeLoading"
            :pagination="typePagination"
            :columns="typeColumns"
            :data="typeList"
            v-model:selected-keys="selectedTypeKeys"
            :row-selection="{ type: 'radio', showCheckedAll: false }"
            @selection-change="handleTypeSelectionChange"
            @page-change="onTypePageChange"
          >
            <template #isEnabled="{ record }">
              <a-tag :color="record.isEnabled ? 'green' : 'red'">
                {{ record.isEnabled ? '启用' : '禁用' }}
              </a-tag>
            </template>
            <template #typeOps="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEditType(record)">
                  <template #icon><icon-edit /></template>
                </a-button>
                <a-popconfirm
                  content="确定删除该字典类型吗？"
                  @ok="handleDeleteType(record.id)"
                >
                  <a-button type="text" size="small" status="danger">
                    <template #icon><icon-delete /></template>
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table>
        </a-card>
      </a-col>
      <a-col :span="15">
        <a-card class="general-card" :title="dataCardTitle">
          <a-form :model="dataQuery" layout="inline" class="dict-search">
            <a-form-item field="keyword">
              <a-input
                v-model="dataQuery.keyword"
                allow-clear
                placeholder="标签/值"
                :disabled="!selectedType"
              />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button
                  type="primary"
                  :disabled="!selectedType"
                  @click="fetchDataList"
                >
                  <template #icon><icon-search /></template>
                  查询
                </a-button>
                <a-button :disabled="!selectedType" @click="resetDataQuery">
                  <template #icon><icon-refresh /></template>
                  重置
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
          <div class="dict-toolbar">
            <a-button type="primary" :disabled="!selectedType" @click="handleAddData">
              <template #icon><icon-plus /></template>
              新增数据
            </a-button>
          </div>
          <a-table
            row-key="id"
            :loading="dataLoading"
            :pagination="false"
            :columns="dataColumns"
            :data="dataList"
          >
            <template #isEnabled="{ record }">
              <a-tag :color="record.isEnabled ? 'green' : 'red'">
                {{ record.isEnabled ? '启用' : '禁用' }}
              </a-tag>
            </template>
            <template #listClass="{ record }">
              <a-tag v-if="record.listClass" :color="record.listClass">
                {{ record.listClass }}
              </a-tag>
              <span v-else>-</span>
            </template>
            <template #dataOps="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEditData(record)">
                  <template #icon><icon-edit /></template>
                </a-button>
                <a-popconfirm
                  content="确定删除该字典数据吗？"
                  @ok="handleDeleteData(record.id)"
                >
                  <a-button type="text" size="small" status="danger">
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
      v-model:visible="typeModalVisible"
      :title="typeIsEdit ? '编辑字典类型' : '新增字典类型'"
      unmount-on-close
      @close="resetTypeForm"
      @before-ok="handleTypeBeforeOk"
    >
      <a-form ref="typeFormRef" layout="vertical" :model="typeForm">
        <a-form-item
          v-if="!typeIsEdit"
          field="code"
          label="类型编码"
          :rules="[{ required: true, message: '类型编码不能为空' }]"
        >
          <a-input v-model="typeForm.code" placeholder="如 sys_user_sex" />
        </a-form-item>
        <a-form-item
          field="name"
          label="类型名称"
          :rules="[{ required: true, message: '类型名称不能为空' }]"
        >
          <a-input v-model="typeForm.name" />
        </a-form-item>
        <a-form-item field="remark" label="备注">
          <a-input v-model="typeForm.remark" />
        </a-form-item>
        <a-form-item v-if="typeIsEdit" field="isEnabled" label="是否启用">
          <a-switch v-model="typeForm.isEnabled" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="dataModalVisible"
      :title="dataIsEdit ? '编辑字典数据' : '新增字典数据'"
      unmount-on-close
      @close="resetDataForm"
      @before-ok="handleDataBeforeOk"
    >
      <a-form ref="dataFormRef" layout="vertical" :model="dataForm">
        <a-form-item
          field="label"
          label="数据标签"
          :rules="[{ required: true, message: '数据标签不能为空' }]"
        >
          <a-input v-model="dataForm.label" />
        </a-form-item>
        <a-form-item
          field="value"
          label="数据值"
          :rules="[{ required: true, message: '数据值不能为空' }]"
        >
          <a-input v-model="dataForm.value" />
        </a-form-item>
        <a-form-item field="sort" label="排序">
          <a-input-number v-model="dataForm.sort" :min="0" />
        </a-form-item>
        <a-form-item field="listClass" label="标签样式">
          <a-input v-model="dataForm.listClass" placeholder="如 green、red、blue" />
        </a-form-item>
        <a-form-item field="remark" label="备注">
          <a-input v-model="dataForm.remark" />
        </a-form-item>
        <a-form-item v-if="dataIsEdit" field="isEnabled" label="是否启用">
          <a-switch v-model="dataForm.isEnabled" />
        </a-form-item>
      </a-form>
    </a-modal>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref, watch } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import type { FormInstance } from '@arco-design/web-vue/es/form';
  import useLoading from '@/hooks/loading';
  import { clearFormValidate } from '@/utils/form';
  import {
    queryDictTypePage,
    addDictType,
    updateDictType,
    deleteDictType,
    DictTypeDto,
  } from '@/api/server/dict-type';
  import {
    queryDictDataList,
    addDictData,
    updateDictData,
    deleteDictData,
    DictDataDto,
  } from '@/api/server/dict-data';

  defineOptions({ name: 'DictList' });

  const { loading: typeLoading, setLoading: setTypeLoading } = useLoading(true);
  const { loading: dataLoading, setLoading: setDataLoading } = useLoading(false);

  const typeList = ref<DictTypeDto[]>([]);
  const dataList = ref<DictDataDto[]>([]);
  const selectedType = ref<DictTypeDto | null>(null);
  const selectedTypeKeys = ref<number[]>([]);

  const typeQuery = reactive({ keyword: '' });
  const dataQuery = reactive({ keyword: '' });

  const typePagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const typeColumns: TableColumnData[] = [
    { title: '编码', dataIndex: 'code', ellipsis: true, tooltip: true },
    { title: '名称', dataIndex: 'name', ellipsis: true, tooltip: true },
    { title: '状态', dataIndex: 'isEnabled', slotName: 'isEnabled', width: 80 },
    { title: '操作', slotName: 'typeOps', width: 90 },
  ];

  const dataColumns: TableColumnData[] = [
    { title: '标签', dataIndex: 'label' },
    { title: '值', dataIndex: 'value' },
    { title: '排序', dataIndex: 'sort', width: 70 },
    { title: '样式', dataIndex: 'listClass', slotName: 'listClass', width: 90 },
    { title: '状态', dataIndex: 'isEnabled', slotName: 'isEnabled', width: 80 },
    { title: '操作', slotName: 'dataOps', width: 90 },
  ];

  const dataCardTitle = computed(() => {
    if (!selectedType.value) {
      return '字典数据（请先选择字典类型）';
    }
    return `字典数据 - ${selectedType.value.name} (${selectedType.value.code})`;
  });

  const fetchTypeList = async () => {
    setTypeLoading(true);
    try {
      const { data } = await queryDictTypePage({
        current: typePagination.current,
        pageSize: typePagination.pageSize,
        keyword: typeQuery.keyword || undefined,
      });
      typeList.value = data.items;
      typePagination.total = data.total;

      if (!typeList.value.length) {
        selectedType.value = null;
        selectedTypeKeys.value = [];
        dataList.value = [];
        return;
      }

      const currentId = selectedType.value?.id;
      const matched = currentId
        ? typeList.value.find((item) => item.id === currentId)
        : null;
      const next = matched || typeList.value[0];
      selectedType.value = next;
      selectedTypeKeys.value = [next.id];
      await fetchDataList();
    } finally {
      setTypeLoading(false);
    }
  };

  const fetchDataList = async () => {
    if (!selectedType.value) {
      dataList.value = [];
      return;
    }
    setDataLoading(true);
    try {
      const { data } = await queryDictDataList({
        dictTypeId: selectedType.value.id,
        keyword: dataQuery.keyword || undefined,
      });
      dataList.value = data;
    } finally {
      setDataLoading(false);
    }
  };

  const searchTypes = () => {
    typePagination.current = 1;
    fetchTypeList();
  };

  const resetTypeQuery = () => {
    typeQuery.keyword = '';
    searchTypes();
  };

  const resetDataQuery = () => {
    dataQuery.keyword = '';
    fetchDataList();
  };

  const onTypePageChange = (page: number) => {
    typePagination.current = page;
    fetchTypeList();
  };

  const handleTypeSelectionChange = (rowKeys: (string | number)[]) => {
    const id = Number(rowKeys[0]);
    if (!id) {
      return;
    }
    const record = typeList.value.find((item) => item.id === id);
    if (!record) {
      return;
    }
    selectedType.value = record;
    fetchDataList();
  };

  const typeModalVisible = ref(false);
  const typeIsEdit = ref(false);
  const typeEditId = ref<number | null>(null);
  const typeFormRef = ref<FormInstance>();
  const typeForm = reactive({
    code: '',
    name: '',
    remark: '',
    isEnabled: true,
  });

  const resetTypeForm = () => {
    typeIsEdit.value = false;
    typeEditId.value = null;
    typeForm.code = '';
    typeForm.name = '';
    typeForm.remark = '';
    typeForm.isEnabled = true;
    clearFormValidate(typeFormRef.value);
  };

  const handleAddType = () => {
    resetTypeForm();
    typeModalVisible.value = true;
  };

  const handleEditType = (record: DictTypeDto) => {
    typeIsEdit.value = true;
    typeEditId.value = record.id;
    typeForm.name = record.name;
    typeForm.remark = record.remark || '';
    typeForm.isEnabled = record.isEnabled;
    typeModalVisible.value = true;
    clearFormValidate(typeFormRef.value);
  };

  const handleTypeBeforeOk = async (done: (closed: boolean) => void) => {
    const validErr = await typeFormRef.value?.validate();
    if (validErr) {
      done(false);
      return;
    }
    try {
      if (typeIsEdit.value && typeEditId.value) {
        await updateDictType({
          id: typeEditId.value,
          name: typeForm.name,
          remark: typeForm.remark,
          isEnabled: typeForm.isEnabled,
        });
        Message.success('字典类型更新成功');
      } else {
        await addDictType({
          code: typeForm.code,
          name: typeForm.name,
          remark: typeForm.remark,
          isEnabled: typeForm.isEnabled,
        });
        Message.success('字典类型创建成功');
      }
      done(true);
      fetchTypeList();
    } catch {
      done(false);
    }
  };

  const handleDeleteType = async (id: number) => {
    try {
      await deleteDictType(id);
      Message.success('字典类型删除成功');
      if (selectedType.value?.id === id) {
        selectedType.value = null;
        selectedTypeKeys.value = [];
        dataList.value = [];
      }
      fetchTypeList();
    } catch {
      // handled by interceptor
    }
  };

  const dataModalVisible = ref(false);
  const dataIsEdit = ref(false);
  const dataEditId = ref<number | null>(null);
  const dataFormRef = ref<FormInstance>();
  const dataForm = reactive({
    label: '',
    value: '',
    sort: 0,
    listClass: '',
    remark: '',
    isEnabled: true,
  });

  const resetDataForm = () => {
    dataIsEdit.value = false;
    dataEditId.value = null;
    dataForm.label = '';
    dataForm.value = '';
    dataForm.sort = 0;
    dataForm.listClass = '';
    dataForm.remark = '';
    dataForm.isEnabled = true;
    clearFormValidate(dataFormRef.value);
  };

  const handleAddData = () => {
    if (!selectedType.value) {
      return;
    }
    resetDataForm();
    dataModalVisible.value = true;
  };

  const handleEditData = (record: DictDataDto) => {
    dataIsEdit.value = true;
    dataEditId.value = record.id;
    dataForm.label = record.label;
    dataForm.value = record.value;
    dataForm.sort = record.sort;
    dataForm.listClass = record.listClass || '';
    dataForm.remark = record.remark || '';
    dataForm.isEnabled = record.isEnabled;
    dataModalVisible.value = true;
    clearFormValidate(dataFormRef.value);
  };

  const handleDataBeforeOk = async (done: (closed: boolean) => void) => {
    if (!selectedType.value) {
      done(false);
      return;
    }
    const validErr = await dataFormRef.value?.validate();
    if (validErr) {
      done(false);
      return;
    }
    try {
      if (dataIsEdit.value && dataEditId.value) {
        await updateDictData({
          id: dataEditId.value,
          label: dataForm.label,
          value: dataForm.value,
          sort: dataForm.sort,
          listClass: dataForm.listClass,
          remark: dataForm.remark,
          isEnabled: dataForm.isEnabled,
        });
        Message.success('字典数据更新成功');
      } else {
        await addDictData({
          dictTypeId: selectedType.value.id,
          label: dataForm.label,
          value: dataForm.value,
          sort: dataForm.sort,
          listClass: dataForm.listClass,
          remark: dataForm.remark,
          isEnabled: dataForm.isEnabled,
        });
        Message.success('字典数据创建成功');
      }
      done(true);
      fetchDataList();
    } catch {
      done(false);
    }
  };

  const handleDeleteData = async (id: number) => {
    try {
      await deleteDictData(id);
      Message.success('字典数据删除成功');
      fetchDataList();
    } catch {
      // handled by interceptor
    }
  };

  watch(
    () => selectedType.value?.id,
    () => {
      dataQuery.keyword = '';
    }
  );

  fetchTypeList();
</script>

<style scoped lang="less">
  .dict-search {
    margin-bottom: 12px;
  }

  .dict-toolbar {
    margin-bottom: 12px;
  }
</style>
