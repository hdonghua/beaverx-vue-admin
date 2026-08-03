<template>
  <router-view v-slot="{ Component, route }">
    <transition name="fade" mode="out-in" appear>
      <keep-alive :include="cacheList">
        <component
          :is="
            resolveRouteComponent(
              Component,
              route.name,
              !route.meta.ignoreCache
            )
          "
          :key="route.fullPath"
        />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script lang="ts" setup>
  import { computed, defineComponent, h, markRaw } from 'vue';
  import type { Component } from 'vue';
  import { useTabBarStore } from '@/store';
  import { getRouteCacheVersion } from '@/utils/route-cache';

  const tabBarStore = useTabBarStore();

  const cacheList = computed(() => tabBarStore.getCacheList);

  const routeComponentMap = new Map<string, Component>();

  const resolveRouteComponent = (
    component: Component,
    routeName?: string | symbol | null,
    shouldCache = true
  ) => {
    const routeCacheName = String(routeName || 'anonymous-route');
    const componentName = shouldCache
      ? routeCacheName
      : `__no_cache__${routeCacheName}`;
    const cacheVersion = shouldCache ? getRouteCacheVersion(routeName) : 0;
    const cacheKey = `${componentName}:${cacheVersion}`;
    const cached = routeComponentMap.get(cacheKey);
    if (cached) {
      return cached;
    }

    Array.from(routeComponentMap.keys())
      .filter((key) => key.startsWith(`${componentName}:`) && key !== cacheKey)
      .forEach((key) => routeComponentMap.delete(key));

    const wrappedComponent = markRaw(
      defineComponent({
        name: componentName,
        render() {
          return h(component);
        },
      })
    );

    routeComponentMap.set(cacheKey, wrappedComponent);
    return wrappedComponent;
  };
</script>

<style scoped lang="less"></style>
