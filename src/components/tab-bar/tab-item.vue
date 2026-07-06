<template>
  <a-dropdown
    trigger="contextMenu"
    :popup-max-height="false"
    @select="actionSelect"
  >
    <span
      class="arco-tag arco-tag-size-medium arco-tag-checked"
      :class="{ 'link-activated': itemData.fullPath === $route.fullPath }"
      @click="goto(itemData)"
    >
      <span class="tag-link">
        {{ tabTitle }}
      </span>
      <span
        class="arco-icon-hover arco-tag-icon-hover arco-icon-hover-size-medium arco-tag-close-btn"
        @click.stop="tagClose(itemData, index)"
      >
        <icon-close />
      </span>
    </span>
    <template #content>
      <a-doption :disabled="disabledReload" :value="Eaction.reload">
        <icon-refresh />
        <span>重新加载</span>
      </a-doption>
      <a-doption
        class="sperate-line"
        :disabled="disabledCurrent"
        :value="Eaction.current"
      >
        <icon-close />
        <span>关闭当前标签页</span>
      </a-doption>
      <a-doption :disabled="disabledLeft" :value="Eaction.left">
        <icon-to-left />
        <span>关闭左侧标签页</span>
      </a-doption>
      <a-doption
        class="sperate-line"
        :disabled="disabledRight"
        :value="Eaction.right"
      >
        <icon-to-right />
        <span>关闭右侧标签页</span>
      </a-doption>
      <a-doption :value="Eaction.others">
        <icon-swap />
        <span>关闭其它标签页</span>
      </a-doption>
      <a-doption :value="Eaction.all">
        <icon-folder-delete />
        <span>关闭全部标签页</span>
      </a-doption>
    </template>
  </a-dropdown>
</template>

<script lang="ts" setup>
  import { PropType, computed } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useAppStore, useTabBarStore } from '@/store';
  import type { TagProps } from '@/store/modules/tab-bar/types';
  import { DEFAULT_ROUTE_NAME, REDIRECT_ROUTE_NAME } from '@/router/constants';
  import {
    ensureExternalRouteByName,
    findMenuRouteByName,
  } from '@/utils/register-server-routes';

  // eslint-disable-next-line no-shadow
  enum Eaction {
    reload = 'reload',
    current = 'current',
    left = 'left',
    right = 'right',
    others = 'others',
    all = 'all',
  }

  const props = defineProps({
    itemData: {
      type: Object as PropType<TagProps>,
      default() {
        return {};
      },
    },
    index: {
      type: Number,
      default: 0,
    },
  });

  const router = useRouter();
  const route = useRoute();
  const appStore = useAppStore();
  const tabBarStore = useTabBarStore();

  const isExternalTag = (tag: TagProps) =>
    Boolean(tag.isExternal || tag.name.startsWith('external-'));

  const resolveExternalTag = (tag: TagProps) => {
    const menuRoute = findMenuRouteByName(appStore.serverMenu, tag.name);
    return {
      title: tag.title || String(menuRoute?.meta?.title || tag.name),
      frameSrc: tag.frameSrc || String(menuRoute?.meta?.frameSrc || ''),
    };
  };

  const tabTitle = computed(() => {
    const { title } = props.itemData;
    if (isExternalTag(props.itemData)) {
      return resolveExternalTag(props.itemData).title;
    }
    return title || '';
  });

  const buildTagLocation = (tag: TagProps) => {
    if (isExternalTag(tag)) {
      ensureExternalRouteByName(router, appStore.serverMenu, tag.name);
      const { frameSrc } = resolveExternalTag(tag);
      return {
        name: tag.name,
        query: frameSrc ? { ...tag.query, frameSrc } : tag.query,
      };
    }
    return {
      name: tag.name,
      query: tag.query,
    };
  };

  const goto = (tag: TagProps) => {
    router.push(buildTagLocation(tag));
  };
  const tagList = computed(() => {
    return tabBarStore.getTabList;
  });

  const disabledReload = computed(() => {
    return props.itemData.fullPath !== route.fullPath;
  });

  const disabledCurrent = computed(() => {
    return props.itemData.name === DEFAULT_ROUTE_NAME;
  });

  const disabledLeft = computed(() => {
    const homeIndex = tagList.value.findIndex(
      (tag) => tag.name === DEFAULT_ROUTE_NAME
    );
    return props.index <= Math.max(homeIndex, 0) + 1;
  });

  const disabledRight = computed(() => {
    return props.index === tagList.value.length - 1;
  });

  const tagClose = (tag: TagProps, idx: number) => {
    if (tag.name === DEFAULT_ROUTE_NAME) {
      return;
    }
    tabBarStore.deleteTag(idx, tag);
    if (props.itemData.fullPath === route.fullPath) {
      const latest = tagList.value[idx - 1];
      router.push(buildTagLocation(latest));
    }
  };

  const findCurrentRouteIndex = () => {
    return tagList.value.findIndex((el) => el.fullPath === route.fullPath);
  };
  const actionSelect = async (value: any) => {
    const { itemData, index } = props;
    const copyTagList = [...tagList.value];
    if (value === Eaction.current) {
      tagClose(itemData, index);
    } else if (value === Eaction.left) {
      const currentRouteIdx = findCurrentRouteIndex();
      copyTagList.splice(1, props.index - 1);

      tabBarStore.freshTabList(copyTagList);
      if (currentRouteIdx < index) {
        router.push(buildTagLocation(itemData));
      }
    } else if (value === Eaction.right) {
      const currentRouteIdx = findCurrentRouteIndex();
      copyTagList.splice(props.index + 1);

      tabBarStore.freshTabList(copyTagList);
      if (currentRouteIdx > index) {
        router.push(buildTagLocation(itemData));
      }
    } else if (value === Eaction.others) {
      const filterList = tagList.value.filter((el, idx) => {
        return el.name === DEFAULT_ROUTE_NAME || idx === props.index;
      });
      tabBarStore.freshTabList(filterList);
      router.push(buildTagLocation(itemData));
    } else if (value === Eaction.reload) {
      tabBarStore.deleteCache(itemData);
      await router.push({
        name: REDIRECT_ROUTE_NAME,
        params: {
          path: route.fullPath,
        },
      });
      tabBarStore.addCache(itemData.name);
    } else {
      tabBarStore.resetTabList();
      router.push({ name: DEFAULT_ROUTE_NAME });
    }
  };
</script>

<style scoped lang="less">
  .tag-link {
    color: var(--color-text-2);
    text-decoration: none;
  }
  .link-activated {
    color: rgb(var(--link-6));
    .tag-link {
      color: rgb(var(--link-6));
    }
    & + .arco-tag-close-btn {
      color: rgb(var(--link-6));
    }
  }
  :deep(.arco-dropdown-option-content) {
    span {
      margin-left: 10px;
    }
  }
  .arco-dropdown-open {
    .tag-link {
      color: rgb(var(--danger-6));
    }
    .arco-tag-close-btn {
      color: rgb(var(--danger-6));
    }
  }
  .sperate-line {
    border-bottom: 1px solid var(--color-neutral-3);
  }
</style>
