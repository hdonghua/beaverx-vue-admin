<template>
  <a-modal
    :visible="visible"
    @update:visible="(value: boolean) => emit('update:visible', value)"
    :footer="false"
    :closable="false"
    :mask-closable="true"
    :align-center="false"
    modal-class="menu-search-modal"
    :width="560"
    @close="handleClose"
  >
    <div class="menu-search">
      <a-input
        ref="inputRef"
        v-model="keyword"
        size="large"
        allow-clear
        :placeholder="$t('menuSearch.placeholder')"
        @input="activeIndex = 0"
        @keydown.down.prevent="moveActive(1)"
        @keydown.up.prevent="moveActive(-1)"
        @keydown.enter.prevent="selectActive"
      >
        <template #prefix>
          <icon-search />
        </template>
        <template #suffix>
          <span class="shortcut-hint">{{ $t('menuSearch.shortcut') }}</span>
        </template>
      </a-input>

      <div v-if="!keyword.trim() && filteredList.length" class="search-hint">
        {{ $t('menuSearch.hint') }}
      </div>

      <a-empty
        v-if="keyword.trim() && !filteredList.length"
        class="search-empty"
        :description="$t('menuSearch.empty')"
      />

      <ul v-else-if="filteredList.length" class="search-list">
        <li
          v-for="(item, index) in filteredList"
          :key="item.name"
          :class="['search-item', { active: index === activeIndex }]"
          @mouseenter="activeIndex = index"
          @click="navigateTo(item)"
        >
          <span class="search-item-icon">
            <component :is="item.icon || 'icon-menu'" />
          </span>
          <span class="search-item-content">
            <span class="search-item-title">{{ item.title }}</span>
            <span v-if="item.breadcrumb" class="search-item-breadcrumb">
              {{ item.breadcrumb }}
            </span>
          </span>
          <icon-right class="search-item-arrow" />
        </li>
      </ul>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
  import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';
  import type { RouteRecordRaw } from 'vue-router';
  import useMenuTree from '@/components/menu/use-menu-tree';
  import { ensureExternalRoute } from '@/utils/register-server-routes';
  import {
    filterMenuSearchItems,
    flattenMenuForSearch,
    MenuSearchItem,
  } from '@/utils/menu-search';

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false,
    },
  });
  const emit = defineEmits(['update:visible']);

  const { t } = useI18n();
  const router = useRouter();
  const { menuTree } = useMenuTree();
  const keyword = ref('');
  const activeIndex = ref(0);
  const inputRef = ref();

  const menuItems = computed(() =>
    flattenMenuForSearch(menuTree.value as RouteRecordRaw[], (route) => {
      const title = route.meta?.title as string | undefined;
      if (title) {
        return title;
      }
      const localeKey = route.meta?.locale as string | undefined;
      return localeKey ? t(localeKey) : String(route.name || '');
    })
  );

  const filteredList = computed(() =>
    filterMenuSearchItems(menuItems.value, keyword.value).slice(0, 20)
  );

  const focusInput = async () => {
    await nextTick();
    inputRef.value?.focus?.();
  };

  const reset = () => {
    keyword.value = '';
    activeIndex.value = 0;
  };

  const handleClose = () => {
    reset();
  };

  const open = () => {
    emit('update:visible', true);
  };

  const close = () => {
    emit('update:visible', false);
    reset();
  };

  const findMenuRoute = (name: string): RouteRecordRaw | undefined => {
    let matched: RouteRecordRaw | undefined;
    const walk = (routes: RouteRecordRaw[]) => {
      routes.some((route) => {
        if (String(route.name) === name) {
          matched = route;
          return true;
        }
        if (route.children?.length) {
          walk(route.children);
        }
        return Boolean(matched);
      });
    };
    walk(menuTree.value as RouteRecordRaw[]);
    return matched;
  };

  const navigateTo = (item: MenuSearchItem) => {
    const menuRoute = findMenuRoute(item.name);
    if (menuRoute?.meta?.isExternal) {
      ensureExternalRoute(router, menuRoute);
    }
    router.push({ name: item.name });
    close();
  };

  const moveActive = (step: number) => {
    if (!filteredList.value.length) {
      return;
    }
    const next =
      (activeIndex.value + step + filteredList.value.length) %
      filteredList.value.length;
    activeIndex.value = next;
  };

  const selectActive = () => {
    const item = filteredList.value[activeIndex.value];
    if (item) {
      navigateTo(item);
    }
  };

  const onGlobalKeydown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (props.visible) {
        close();
      } else {
        open();
      }
    }
  };

  watch(
    () => props.visible,
    (value) => {
      if (value) {
        focusInput();
      }
    }
  );

  watch(filteredList, () => {
    if (activeIndex.value >= filteredList.value.length) {
      activeIndex.value = 0;
    }
  });

  onMounted(() => {
    window.addEventListener('keydown', onGlobalKeydown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', onGlobalKeydown);
  });

  defineExpose({ open });
</script>

<style scoped lang="less">
  .menu-search {
    padding: 4px 0 8px;
  }

  .shortcut-hint {
    padding: 2px 6px;
    font-size: 12px;
    color: var(--color-text-3);
    background: var(--color-fill-2);
    border-radius: 4px;
  }

  .search-hint,
  .search-empty {
    margin-top: 24px;
  }

  .search-hint {
    font-size: 13px;
    color: var(--color-text-3);
    text-align: center;
  }

  .search-list {
    max-height: 360px;
    margin: 12px 0 0;
    padding: 0;
    overflow: auto;
    list-style: none;
  }

  .search-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover,
    &.active {
      background-color: var(--color-fill-2);
    }
  }

  .search-item-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: rgb(var(--primary-6));
    background: rgb(var(--primary-1));
    border-radius: 8px;
    font-size: 16px;
  }

  .search-item-content {
    flex: 1;
    min-width: 0;
  }

  .search-item-title {
    display: block;
    font-size: 14px;
    line-height: 22px;
    color: var(--color-text-1);
  }

  .search-item-breadcrumb {
    display: block;
    overflow: hidden;
    font-size: 12px;
    line-height: 18px;
    color: var(--color-text-3);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .search-item-arrow {
    flex-shrink: 0;
    color: var(--color-text-4);
    font-size: 14px;
  }
</style>

<style lang="less">
  .menu-search-modal {
    .arco-modal-header {
      display: none;
    }

    .arco-modal-body {
      padding: 20px 20px 16px;
    }
  }
</style>
