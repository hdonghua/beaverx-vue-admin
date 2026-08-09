<template>
  <a-card
    class="general-card"
    title="开源仓库"
    :header-style="{ paddingBottom: '0' }"
    :body-style="{ padding: '14px 16px 16px' }"
  >
    <p class="tip">
      项目完全开源，觉得好用的话去 GitHub 点个 Star 支持一下呗～
    </p>
    <div class="repo-list">
      <a
        v-for="repo in repos"
        :key="repo.url"
        class="repo-item"
        :href="repo.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div class="icon">
          <icon-github />
        </div>
        <div class="meta">
          <div class="name">{{ repo.name }}</div>
          <div class="desc">{{ repo.desc }}</div>
        </div>
        <icon-launch class="launch" />
      </a>
    </div>
  </a-card>
</template>

<script lang="ts" setup>
  const repos = [
    {
      name: 'beaverx-vue-admin',
      desc: '前端仓库',
      url: 'https://github.com/hdonghua/beaverx-vue-admin',
    },
    {
      name: 'BeaverX.Admin',
      desc: '后端仓库',
      url: 'https://github.com/hdonghua/BeaverX.Admin',
    },
  ];
</script>

<style scoped lang="less">
  .tip {
    margin: 0 0 12px;
    color: var(--color-text-3);
    font-size: 12px;
    line-height: 1.6;
  }

  .repo-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .repo-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 6px;
    background: var(--color-fill-1);
    color: inherit;
    text-decoration: none;
    transition: background-color 0.2s;

    &:hover {
      background: var(--color-fill-2);

      .name,
      .launch {
        color: rgb(var(--arcoblue-6));
      }
    }
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: var(--color-bg-2);
    color: var(--color-text-1);
    font-size: 18px;
  }

  .meta {
    flex: 1;
    min-width: 0;
  }

  .name {
    color: var(--color-text-1);
    font-size: 13px;
    font-weight: 500;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .desc {
    margin-top: 2px;
    color: var(--color-text-3);
    font-size: 12px;
  }

  .launch {
    color: var(--color-text-3);
    font-size: 14px;
  }
</style>
