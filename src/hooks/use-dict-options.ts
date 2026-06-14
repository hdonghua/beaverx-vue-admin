import { computed, ref, unref, watch, type MaybeRef } from 'vue';
import type { DictOptionDto } from '@/api/server/system/dict-data';
import {
  getCachedDictOptions,
  loadDictOptions,
  findDictOption,
  getDictLabel,
  getDictListClass,
  toDictSelectOptions,
} from '@/utils/dict-options';

export function useDictOptions(
  typeCode: MaybeRef<string>,
  options?: { immediate?: boolean }
) {
  const loading = ref(false);
  const loaded = ref(false);
  const dictOptions = ref<DictOptionDto[]>([]);

  const ensureLoaded = async (force = false) => {
    const code = unref(typeCode);
    if (!code) {
      dictOptions.value = [];
      loaded.value = true;
      return [];
    }

    if (!force && loaded.value && getCachedDictOptions(code).length > 0) {
      dictOptions.value = getCachedDictOptions(code);
      return dictOptions.value;
    }

    loading.value = true;
    try {
      dictOptions.value = await loadDictOptions(code, force);
      loaded.value = true;
      return dictOptions.value;
    } finally {
      loading.value = false;
    }
  };

  const selectOptions = computed(() => dictOptions.value);

  const getLabel = (value: string | number | null | undefined, fallback = '-') =>
    getDictLabel(unref(typeCode), value, fallback);

  const getTagColor = (value: string | number | null | undefined) =>
    getDictListClass(unref(typeCode), value);

  const findOption = (value: string | number | null | undefined) =>
    findDictOption(unref(typeCode), value);

  if (options?.immediate !== false) {
    watch(
      () => unref(typeCode),
      (code) => {
        if (code) {
          ensureLoaded();
        }
      },
      { immediate: true }
    );
  }

  return {
    loading,
    loaded,
    options: selectOptions,
    ensureLoaded,
    getLabel,
    getTagColor,
    findOption,
    toSelectOptions: (valueType: 'string' | 'number' = 'string') =>
      toDictSelectOptions(dictOptions.value, valueType),
  };
}
