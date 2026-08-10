<template>
  <component
    :is="containerTag"
    v-bind="containerProps"
    :class="containerClass"
  >
    <a-row v-if="hasSearch">
      <a-col :flex="1">
        <a-form
          :model="searchFormModel"
          :label-col-props="searchLabelColProps"
          :wrapper-col-props="searchWrapperColProps"
          :label-align="searchLabelAlign"
        >
          <slot name="search" />
        </a-form>
      </a-col>
    </a-row>
    <a-divider v-if="hasSearch && hasToolbar && showDivider" style="margin-top: 0" />
    <slot name="before-table" />
    <a-row v-if="hasToolbar" class="toolbar-row">
      <a-col :span="12">
        <slot name="toolbar-left" />
      </a-col>
      <a-col :span="12" class="toolbar-actions">
        <slot name="toolbar-right" />
        <a-tooltip v-if="showRefresh" content="刷新">
          <div class="action-icon" @click="emit('refresh')">
            <icon-refresh size="18" />
          </div>
        </a-tooltip>
        <a-dropdown v-if="showDensity" @select="handleSelectDensity">
          <a-tooltip content="密度">
            <div class="action-icon">
              <icon-line-height size="18" />
            </div>
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
        <a-tooltip v-if="showColumnSetting" content="列设置">
          <a-popover
            trigger="click"
            position="bl"
            @popup-visible-change="popupVisibleChange"
          >
            <div class="action-icon">
              <icon-settings size="18" />
            </div>
            <template #content>
              <div ref="tableSettingRef">
                <div
                  v-for="(item, index) in showColumns"
                  :key="String(item.dataIndex)"
                  class="setting"
                >
                  <div class="setting-drag">
                    <icon-drag-arrow />
                  </div>
                  <div>
                    <a-checkbox
                      v-model="item.checked"
                      @change="handleChange($event, item, index)"
                    />
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
      v-bind="tableAttrs"
      :loading="loading"
      :pagination="resolvedPagination"
      :columns="(cloneColumns as TableColumnData[])"
      :data="data"
      :bordered="bordered"
      :size="size"
      @page-size-change="handlePageSizeChange"
    >
      <template
        v-for="name in tableSlotNames"
        :key="name"
        #[name]="slotScope"
      >
        <slot :name="name" v-bind="slotScope || {}" />
      </template>
    </a-table>
  </component>
</template>

<script lang="ts" setup>
  import { computed, nextTick, onBeforeUnmount, ref, useAttrs, useSlots, watch } from 'vue';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import type { PaginationProps, SelectProps } from '@arco-design/web-vue';
  import cloneDeep from 'lodash/cloneDeep';
  import Sortable from 'sortablejs';

  defineOptions({
    name: 'QueryTable',
    inheritAttrs: false,
  });

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: boolean };
  type GenericRecord = Record<string, any>;

  interface Props {
    title?: string;
    loading?: boolean;
    pagination?: boolean | GenericRecord;
    columns?: TableColumnData[];
    data?: any[];
    bordered?: boolean | GenericRecord;
    defaultSize?: SizeProps;
    useCard?: boolean;
    showSearch?: boolean;
    showToolbar?: boolean;
    searchFormModel?: GenericRecord;
    searchLabelColProps?: GenericRecord;
    searchWrapperColProps?: GenericRecord;
    searchLabelAlign?: 'left' | 'right';
    showRefresh?: boolean;
    showDensity?: boolean;
    showColumnSetting?: boolean;
    showDivider?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '',
    loading: false,
    pagination: undefined,
    columns: () => [],
    data: () => [],
    bordered: false,
    defaultSize: 'medium',
    useCard: true,
    showSearch: true,
    showToolbar: true,
    searchFormModel: undefined,
    searchLabelColProps: () => ({ span: 6 }),
    searchWrapperColProps: () => ({ span: 18 }),
    searchLabelAlign: 'left',
    showRefresh: true,
    showDensity: true,
    showColumnSetting: true,
    showDivider: true,
  });

  const emit = defineEmits<{
    (e: 'refresh'): void;
  }>();

  const tableAttrs = useAttrs();
  const slots = useSlots();

  const size = ref<SizeProps>(props.defaultSize);
  const cloneColumns = ref<Column[]>([]);
  const showColumns = ref<Column[]>([]);
  const tableSettingRef = ref<HTMLElement>();

  const reservedSlotNames = new Set([
    'search',
    'toolbar-left',
    'toolbar-right',
    'before-table',
  ]);
  const densityList = [
    {
      name: '紧凑',
      value: 'mini',
    },
    {
      name: '较小',
      value: 'small',
    },
    {
      name: '中等',
      value: 'medium',
    },
    {
      name: '宽松',
      value: 'large',
    },
  ] as const;

  let sortableInstance: Sortable | null = null;

  const containerTag = computed(() => (props.useCard ? 'a-card' : 'div'));
  const containerProps = computed(() =>
    props.useCard
      ? {
          title: props.title,
        }
      : {}
  );
  const containerClass = computed(() => ({
    'general-card': props.useCard,
    'query-table': true,
  }));

  const hasSearch = computed(() => props.showSearch && Boolean(slots.search));
  const hasToolbar = computed(
    () =>
      props.showToolbar &&
      (Boolean(slots['toolbar-left']) ||
        Boolean(slots['toolbar-right']) ||
        props.showRefresh ||
        props.showDensity ||
        props.showColumnSetting)
  );
  const tableSlotNames = computed(() =>
    Object.keys(slots).filter(
      (name) => name !== 'default' && !reservedSlotNames.has(name)
    )
  );

  const defaultPaginationProps = {
    showTotal: true,
    showPageSize: true,
    pageSizeOptions: [10, 20, 50, 100],
    pageSizeProps: {
      style: { width: '110px' },
    },
  };

  const resolvedPagination = computed(() => {
    if (props.pagination === false || props.pagination === undefined) {
      return props.pagination;
    }
    if (props.pagination === true) {
      return { ...defaultPaginationProps };
    }
    return {
      ...defaultPaginationProps,
      ...props.pagination,
    };
  });

  const destroySortable = () => {
    sortableInstance?.destroy();
    sortableInstance = null;
  };

  const handlePageSizeChange = (pageSize: number) => {
    if (props.pagination && typeof props.pagination === 'object') {
      props.pagination.pageSize = pageSize;
      if ('current' in props.pagination) {
        props.pagination.current = 1;
      }
    }
    const attrHandler = tableAttrs.onPageSizeChange;
    if (typeof attrHandler === 'function') {
      attrHandler(pageSize);
    }
    emit('refresh');
  };

  const handleSelectDensity = (
    value: string | number | Record<string, any> | undefined
  ) => {
    size.value = value as SizeProps;
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
      return;
    }
    cloneColumns.value.splice(index, 0, column);
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

  const popupVisibleChange = (visible: boolean) => {
    if (!visible) {
      destroySortable();
      return;
    }
    nextTick(() => {
      if (!tableSettingRef.value) {
        return;
      }
      destroySortable();
      sortableInstance = Sortable.create(tableSettingRef.value, {
        onEnd(event) {
          const { oldIndex, newIndex } = event;
          if (oldIndex === undefined || newIndex === undefined) {
            return;
          }
          exchangeArray(cloneColumns.value, oldIndex, newIndex);
          exchangeArray(showColumns.value, oldIndex, newIndex);
        },
      });
    });
  };

  watch(
    () => props.columns,
    (value) => {
      cloneColumns.value = cloneDeep(value || []);
      cloneColumns.value.forEach((item) => {
        item.checked = true;
      });
      showColumns.value = cloneDeep(cloneColumns.value);
    },
    { deep: true, immediate: true }
  );

  onBeforeUnmount(() => {
    destroySortable();
  });
</script>

<style scoped lang="less">
  .query-table {
    width: 100%;
  }

  .toolbar-row {
    margin-bottom: 16px;
  }

  .toolbar-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
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

  .setting-drag {
    margin-right: 4px;
    cursor: move;
  }
</style>
