import { getDictOptions, DictOptionDto } from '@/api/server/dict-data';

const cache = new Map<string, DictOptionDto[]>();
const pending = new Map<string, Promise<DictOptionDto[]>>();

export function normalizeDictValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

export function hasDictValue(value: string | number | null | undefined) {
  return value === 0 || value === '0' || Boolean(value);
}

export function getCachedDictOptions(typeCode: string) {
  return cache.get(typeCode) ?? [];
}

export async function loadDictOptions(typeCode: string, force = false) {
  if (!force && cache.has(typeCode)) {
    return cache.get(typeCode)!;
  }

  if (!force && pending.has(typeCode)) {
    return pending.get(typeCode)!;
  }

  const request = getDictOptions(typeCode)
    .then(({ data }) => {
      const options = data ?? [];
      cache.set(typeCode, options);
      pending.delete(typeCode);
      return options;
    })
    .catch((error) => {
      pending.delete(typeCode);
      throw error;
    });

  pending.set(typeCode, request);
  return request;
}

export function findDictOption(
  typeCode: string,
  value: string | number | null | undefined
) {
  if (!hasDictValue(value)) {
    return undefined;
  }

  const normalized = normalizeDictValue(value);
  return getCachedDictOptions(typeCode).find(
    (item) => normalizeDictValue(item.value) === normalized
  );
}

export function getDictLabel(
  typeCode: string,
  value: string | number | null | undefined,
  fallback = '-'
) {
  return findDictOption(typeCode, value)?.label ?? fallback;
}

export function getDictListClass(
  typeCode: string,
  value: string | number | null | undefined
) {
  const listClass = findDictOption(typeCode, value)?.listClass;
  return listClass?.trim() ? listClass : undefined;
}

export function clearDictOptionsCache(typeCode?: string) {
  if (typeCode) {
    cache.delete(typeCode);
    pending.delete(typeCode);
    return;
  }

  cache.clear();
  pending.clear();
}

export function toDictSelectOptions(
  options: DictOptionDto[],
  valueType: 'string' | 'number' = 'string'
) {
  return options.map((item) => ({
    label: item.label,
    value: valueType === 'number' ? Number(item.value) : item.value,
    listClass: item.listClass,
  }));
}
