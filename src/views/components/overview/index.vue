<template>
  <PageContainer :breadcrumb="['menu.components', 'menu.components.overview']">
    <a-card class="general-card" title="组件概览">
      <p class="intro">
        本目录收录项目内常用业务组件，每个子页面包含效果展示与基础用法说明。
        菜单为前端静态配置，不依赖后端菜单管理。
      </p>
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="item in items"
          :key="item.name"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <a-card hoverable class="component-card" @click="go(item.name)">
            <div class="component-card__title">{{ item.title }}</div>
            <div class="component-card__desc">{{ item.desc }}</div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { useRouter } from 'vue-router';
  import PageContainer from '@/components/page-container/index.vue';

  const router = useRouter();

  const items = [
    {
      name: 'ComponentDictSelect',
      title: 'DictSelect 字典选择',
      desc: '字典下拉选择，自动加载字典数据',
    },
    {
      name: 'ComponentDictTag',
      title: 'DictTag 字典标签',
      desc: '字典标签展示，支持颜色与纯文本',
    },
    {
      name: 'ComponentSvgIcon',
      title: 'SvgIcon 图标',
      desc: '本地 SVG 雪碧图图标',
    },
    {
      name: 'ComponentRichText',
      title: 'RichText 富文本',
      desc: '基于 wangEditor 的富文本编辑器',
    },
    {
      name: 'ComponentSignaturePad',
      title: 'SignaturePad 签名板',
      desc: '手写签名并导出 Base64 图片',
    },
    {
      name: 'ComponentBackToTop',
      title: 'BackToTop 回到顶部',
      desc: '指定容器内滚动回到顶部',
    },
    {
      name: 'ComponentEditableText',
      title: 'EditableText 可编辑文本',
      desc: '点击切换为输入框编辑',
    },
    {
      name: 'ComponentRollLoading',
      title: 'RollLoading 滚动加载',
      desc: 'IntersectionObserver 触底加载',
    },
    {
      name: 'ComponentLoadingLayer',
      title: 'LoadingLayer 加载遮罩',
      desc: '局部或全屏加载遮罩',
    },
    {
      name: 'ComponentPermission',
      title: 'v-permission 权限指令',
      desc: '按钮级权限控制与脚本校验',
    },
  ];

  function go(name: string) {
    router.push({ name });
  }
</script>

<style scoped lang="less">
  .intro {
    margin: 0 0 20px;
    color: var(--color-text-3);
    line-height: 1.6;
  }

  .component-card {
    cursor: pointer;
    min-height: 108px;

    &__title {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-1);
      margin-bottom: 8px;
    }

    &__desc {
      color: var(--color-text-3);
      font-size: 13px;
      line-height: 1.5;
    }
  }
</style>
