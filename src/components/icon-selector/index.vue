<template>
  <div class="icon-selector" :class="{ readonly }">
    <a-popover
      v-if="!readonly"
      v-model:visible="popoverVisible"
      trigger="click"
      position="bl"
      :width="360"
    >
      <div class="icon-preview">
        <component :is="currentIcon" />
        <span>{{ modelValue || '请选择图标' }}</span>
        <icon-down class="arrow-icon" :class="{ expanded: popoverVisible }" />
      </div>
      <template #content>
        <div class="icon-tabs">
          <div class="tabs-header">
            <a-radio-group type="button" v-model="activeCategory" size="small">
              <a-radio
                v-for="item in categories"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </a-radio>
            </a-radio-group>
          </div>
          <div class="icon-list">
            <div
              v-for="icon in currentIcons"
              :key="icon"
              class="icon-item"
              :class="{ active: modelValue === icon }"
              @click="selectIcon(icon)"
            >
              <component :is="getIconComponent(icon)" />
            </div>
          </div>
        </div>
      </template>
    </a-popover>
    <div v-else class="icon-readonly">
      <component :is="currentIcon" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import * as ArcoIcons from '@arco-design/web-vue/es/icon';

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      readonly?: boolean;
    }>(),
    {
      readonly: false,
    }
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
  }>();

  const popoverVisible = ref(false);
  const activeCategory = ref('direction');

  const categories = [
    { value: 'common', label: '通用' },
    { value: 'direction', label: '方向指示' },
    { value: 'tip', label: '提示建议' },
    { value: 'interaction', label: '交互按钮' },
    { value: 'edit', label: '编辑类' },
    { value: 'media', label: '影音类' },
    { value: 'trademark', label: '商标类' },
  ];

  const iconData: Record<string, string[]> = {
    common: [
      'icon-chinese-fill',
      'icon-english-fill',
      'icon-face-frown-fill',
      'icon-face-meh-fill',
      'icon-face-smile-fill',
      'icon-moon-fill',
      'icon-pen-fill',
      'icon-sun-fill',
      'icon-apps',
      'icon-archive',
      'icon-bar-chart',
      'icon-book',
      'icon-bookmark',
      'icon-branch',
      'icon-bug',
      'icon-bulb',
      'icon-calendar-clock',
      'icon-calendar',
      'icon-camera',
      'icon-cloud',
      'icon-command',
      'icon-common',
      'icon-compass',
      'icon-computer',
      'icon-copyright',
      'icon-dashboard',
      'icon-desktop',
      'icon-dice',
      'icon-drag-dot-vertical',
      'icon-drag-dot',
      'icon-drive-file',
      'icon-ear',
      'icon-email',
      'icon-empty',
      'icon-experiment',
      'icon-file-audio',
      'icon-file-image',
      'icon-file-pdf',
      'icon-file-video',
      'icon-file',
      'icon-fire',
      'icon-folder-add',
      'icon-folder-delete',
      'icon-folder',
      'icon-gift',
      'icon-idcard',
      'icon-image-close',
      'icon-image',
      'icon-interaction',
      'icon-language',
      'icon-layers',
      'icon-layout',
      'icon-loading',
      'icon-location',
      'icon-lock',
      'icon-loop',
      'icon-man',
      'icon-menu',
      'icon-mind-mapping',
      'icon-mobile',
      'icon-moon',
      'icon-mosaic',
      'icon-nav',
      'icon-notification-close',
      'icon-notification',
      'icon-palette',
      'icon-pen',
      'icon-phone',
      'icon-printer',
      'icon-public',
      'icon-pushpin',
      'icon-qrcode',
      'icon-relation',
      'icon-robot-add',
      'icon-robot',
      'icon-safe',
      'icon-schedule',
      'icon-shake',
      'icon-skin',
      'icon-stamp',
      'icon-storage',
      'icon-subscribe-add',
      'icon-subscribe',
      'icon-subscribed',
      'icon-sun',
      'icon-tag',
      'icon-tags',
      'icon-thunderbolt',
      'icon-tool',
      'icon-trophy',
      'icon-unlock',
      'icon-user-add',
      'icon-user-group',
      'icon-user',
      'icon-video-camera',
      'icon-wifi',
      'icon-woman',
    ],
    direction: [
      'icon-arrow-down',
      'icon-arrow-fall',
      'icon-arrow-left',
      'icon-arrow-right',
      'icon-arrow-rise',
      'icon-arrow-up',
      'icon-caret-down',
      'icon-caret-left',
      'icon-caret-right',
      'icon-caret-up',
      'icon-double-down',
      'icon-double-left',
      'icon-double-right',
      'icon-double-up',
      'icon-down-circle',
      'icon-down',
      'icon-drag-arrow',
      'icon-expand',
      'icon-left-circle',
      'icon-left',
      'icon-menu-fold',
      'icon-menu-unfold',
      'icon-right-circle',
      'icon-right',
      'icon-rotate-left',
      'icon-rotate-right',
      'icon-shrink',
      'icon-swap',
      'icon-to-bottom',
      'icon-to-left',
      'icon-to-right',
      'icon-to-top',
      'icon-up-circle',
      'icon-up',
    ],
    tip: [
      'icon-check-circle-fill',
      'icon-close-circle-fill',
      'icon-exclamation-circle-fill',
      'icon-exclamation-polygon-fill',
      'icon-info-circle-fill',
      'icon-minus-circle-fill',
      'icon-plus-circle-fill',
      'icon-question-circle-fill',
      'icon-check-circle',
      'icon-check-square',
      'icon-check',
      'icon-clock-circle',
      'icon-close-circle',
      'icon-close',
      'icon-exclamation-circle',
      'icon-exclamation',
      'icon-info-circle',
      'icon-info',
      'icon-minus-circle',
      'icon-minus',
      'icon-plus-circle',
      'icon-plus',
      'icon-question-circle',
      'icon-question',
      'icon-stop',
    ],
    interaction: [
      'icon-heart-fill',
      'icon-star-fill',
      'icon-thumb-down-fill',
      'icon-thumb-up-fill',
      'icon-at',
      'icon-cloud-download',
      'icon-code-block',
      'icon-code-square',
      'icon-code',
      'icon-customer-service',
      'icon-download',
      'icon-export',
      'icon-eye-invisible',
      'icon-eye',
      'icon-heart',
      'icon-history',
      'icon-home',
      'icon-import',
      'icon-launch',
      'icon-list',
      'icon-message-banned',
      'icon-message',
      'icon-more-vertical',
      'icon-more',
      'icon-poweroff',
      'icon-refresh',
      'icon-reply',
      'icon-save',
      'icon-scan',
      'icon-search',
      'icon-select-all',
      'icon-send',
      'icon-settings',
      'icon-share-alt',
      'icon-share-external',
      'icon-share-internal',
      'icon-star',
      'icon-sync',
      'icon-thumb-down',
      'icon-thumb-up',
      'icon-translate',
      'icon-upload',
      'icon-voice',
    ],
    edit: [
      'icon-align-center',
      'icon-align-left',
      'icon-align-right',
      'icon-attachment',
      'icon-bg-colors',
      'icon-bold',
      'icon-brush',
      'icon-copy',
      'icon-delete',
      'icon-edit',
      'icon-eraser',
      'icon-filter',
      'icon-find-replace',
      'icon-font-colors',
      'icon-formula',
      'icon-h1',
      'icon-h2',
      'icon-h3',
      'icon-h4',
      'icon-h5',
      'icon-h6',
      'icon-h7',
      'icon-highlight',
      'icon-italic',
      'icon-line-height',
      'icon-link',
      'icon-oblique-line',
      'icon-ordered-list',
      'icon-original-size',
      'icon-paste',
      'icon-quote',
      'icon-redo',
      'icon-scissor',
      'icon-sort-ascending',
      'icon-sort-descending',
      'icon-sort',
      'icon-strikethrough',
      'icon-underline',
      'icon-undo',
      'icon-unordered-list',
      'icon-zoom-in',
      'icon-zoom-out',
    ],
    media: [
      'icon-mute-fill',
      'icon-pause-circle-fill',
      'icon-play-arrow-fill',
      'icon-play-circle-fill',
      'icon-skip-next-fill',
      'icon-skip-previous-fill',
      'icon-sound-fill',
      'icon-backward',
      'icon-forward',
      'icon-fullscreen-exit',
      'icon-fullscreen',
      'icon-live-broadcast',
      'icon-music',
      'icon-mute',
      'icon-pause-circle',
      'icon-pause',
      'icon-play-arrow',
      'icon-play-circle',
      'icon-record-stop',
      'icon-record',
      'icon-skip-next',
      'icon-skip-previous',
      'icon-sound',
    ],
    trademark: [
      'icon-bytedance-color',
      'icon-lark-color',
      'icon-tiktok-color',
      'icon-xigua-color',
      'icon-faceBook-circle-fill',
      'icon-facebook-square-fill',
      'icon-google-circle-fill',
      'icon-qq-circle-fill',
      'icon-twitter-circle-fill',
      'icon-weibo-circle-fill',
      'icon-alipay-circle',
      'icon-code-sandbox',
      'icon-codepen',
      'icon-facebook',
      'icon-github',
      'icon-gitlab',
      'icon-google',
      'icon-qq-zone',
      'icon-qq',
      'icon-twitter',
      'icon-wechat',
      'icon-wechatpay',
      'icon-weibo',
    ],
  };

  const currentIcons = computed(() => {
    return iconData[activeCategory.value] || [];
  });

  const getIconComponent = (iconName?: string) => {
    if (!iconName) return 'IconApp';
    const name = `Icon${iconName
      .replace(/^icon-/, '')
      .replace(/-([a-z])/g, (_, c) => c.toUpperCase())
      .replace(/^./, (s) => s.toUpperCase())}`;
    return ArcoIcons[name as keyof typeof ArcoIcons] || 'IconApp';
  };

  const currentIcon = computed(() => getIconComponent(props.modelValue));

  const selectIcon = (icon: string) => {
    emit('update:modelValue', icon);
    popoverVisible.value = false;
  };
</script>

<style scoped lang="less">
  .icon-selector {
    width: 100%;
  }

  .icon-preview {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    cursor: pointer;
    min-height: 32px;
    transition: all 0.2s;
    &:hover {
      border-color: rgb(var(--primary-6));
    }
    &.readonly {
      cursor: default;
      background-color: var(--color-fill-1);
      &:hover {
        border-color: var(--color-border);
      }
    }
  }

  .arrow-icon {
    margin-left: auto;
    transition: transform 0.2s;
    &.expanded {
      transform: rotate(180deg);
    }
  }

  .icon-tabs {
    .tabs-header {
      padding-bottom: 8px;
      border-bottom: 1px solid var(--color-border);
      margin-bottom: 8px;
    }
  }

  .icon-list {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 8px;
    max-height: 320px;
    overflow-y: auto;
    padding: 4px;
  }

  .icon-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      background-color: var(--color-fill-2);
    }
    &.active {
      background-color: var(--color-primary-light-1);
      color: rgb(var(--primary-6));
    }
  }

  .icon-readonly {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-2);
  }
</style>
