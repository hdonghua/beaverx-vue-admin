<template>
  <div class="container">
    <Breadcrumb :items="['menu.system', 'menu.system.deptList']" />
    <a-card class="general-card" :title="$t('menu.system.deptList')">
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
        <template #operations="{ record }">
          <a-button type="text" size="small" @click="handleAdd(record)">
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
            content="确定要删除该部门吗？"
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
      :title="isEdit ? '编辑部门' : '创建部门'"
      @cancel="handleCancel"
      @before-ok="handleBeforeOk"
    >
      <a-form ref="operationFormRef" layout="vertical" :model="operationForm">
        <a-form-item
          field="name"
          label="部门名称"
          :rules="[{ required: true, message: '部门名称不能为空' }]"
        >
          <a-input v-model="operationForm.name" />
        </a-form-item>
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
    queryDepts,
    addDept,
    updateDept,
    deleteDept,
    DeptInfo,
    AddDeptRequest,
    UpdateDeptRequest,
  } from '@/api/server/dept';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import type { FormInstance } from '@arco-design/web-vue';

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';

  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref<DeptInfo[]>([]);
  const size = ref<SizeProps>('medium');

  const columns = computed<TableColumnData[]>(() => [
    {
      title: t('searchTable.columns.index'),
      dataIndex: 'index',
      slotName: 'index',
      width: 80,
    },
    {
      title: '部门名称',
      dataIndex: 'name',
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
  const parentId = ref<number>(0);
  const operationForm = reactive<AddDeptRequest>({
    name: '',
    parentId: 0,
  });

  const handleBeforeOk = async (done: (closed: boolean) => void) => {
    const validErr = await operationFormRef.value?.validate();
    if (!validErr) {
      try {
        if (isEdit.value && currentEditId.value) {
          const req: UpdateDeptRequest = {
            id: currentEditId.value,
            ...operationForm,
          };
          await updateDept(req);
          Message.success('更新成功');
        } else {
          await addDept(operationForm);
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
    operationForm.name = '';
    operationForm.parentId = 0;
  };

  const handleAdd = (record?: DeptInfo | null) => {
    isEdit.value = false;
    currentEditId.value = null;
    resetForm();
    if (record) {
      parentId.value = record.id;
      operationForm.parentId = record.id;
    } else {
      parentId.value = 0;
      operationForm.parentId = 0;
    }
    modalVisible.value = true;
  };

  const handleEdit = (record: DeptInfo) => {
    isEdit.value = true;
    currentEditId.value = record.id;
    parentId.value = record.parentId;
    operationForm.name = record.name;
    operationForm.parentId = record.parentId;
    modalVisible.value = true;
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDept(id);
      Message.success('删除成功');
      fetchData();
    } catch {
      // error handled by interceptor
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await queryDepts();
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
    name: 'DeptList',
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
