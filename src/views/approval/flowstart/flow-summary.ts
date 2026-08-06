import { WIDGET } from '@/components/flow/common/FlowConstant';
import ObjectUtil from '@/components/flow/common/ObjectUtil';

const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : value == null ? [] : [value];

const asText = (value: unknown): string => {
  if (value == null || value === '') return '-';
  if (typeof value === 'object') {
    const item = value as { name?: unknown; id?: unknown };
    return String(item.name ?? item.id ?? '');
  }
  return String(value);
};

export const formatFlowSummaryItem = (item: any, organStore: any): string => {
  const values = asArray(item?.value);
  if (values.length === 0) return '-';

  if (item.type === WIDGET.EMPLOYEE) {
    return values.map((value) => {
      const id = asText(value);
      return organStore.getUserById(id).name || id;
    }).join(' / ');
  }

  if (item.type === WIDGET.DEPARTMENT) {
    return values.map((value) => {
      const id = asText(value);
      return organStore.getDeptById(id).name || id;
    }).join(' / ');
  }

  if ([WIDGET.SINGLE_CHOICE, WIDGET.MULTI_CHOICE].includes(item.type)) {
    return values.map((value) => {
      const text = asText(value);
      return item.options?.find((option: string) => option === text) || text;
    }).join(' / ');
  }

  if (item.type === WIDGET.DATE_RANGE) return values.map(asText).join(' - ');
  if (item.type === WIDGET.AREA) return values.map(asText).join(' / ');
  if (item.type === WIDGET.MONEY && item.comma) {
    return String(ObjectUtil.comma(asText(item.value)) ?? '-');
  }

  return values.map(asText).join(' / ');
};
