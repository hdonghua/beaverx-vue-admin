<!-- 富文本组件 -->
<template>
  <div class="widget-rich-text">
    <Toolbar
      class="toolbar"
      :editor="editorRef"
      :default-config="toolbarConfig"
      :mode="mode"
    />
    <Editor
      class="editor"
      v-model="valueHtml"
      :default-config="editorConfig"
      :mode="mode"
      @on-created="handleCreated"
      @on-change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
  import { Message } from '@arco-design/web-vue';
  import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
  import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor';
  import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
  import { uploadFile } from '@/api/server/common/file';
  import { resolveApiUrl } from '@/utils/asset-url';

  const props = withDefaults(
    defineProps<{
      value?: string;
      placeholder?: string;
      disabled?: boolean;
      /** MinIO 上传目录 */
      uploadFolder?: string;
    }>(),
    {
      value: '<p></p>',
      placeholder: '请输入内容...',
      disabled: false,
      uploadFolder: 'rich-text',
    }
  );

  const emits = defineEmits<{
    (e: 'update:value', value: string): void;
  }>();

  const editorRef = shallowRef<IDomEditor>();
  const valueHtml = ref('<p></p>');
  const mode = ref<'default' | 'simple'>('default');

  const toolbarConfig: Partial<IToolbarConfig> = {
    toolbarKeys: [
      'blockquote',
      'header1',
      'header2',
      'header3',
      '|',
      'bold',
      'underline',
      'italic',
      'through',
      'color',
      'bgColor',
      '|',
      'bulletedList',
      'numberedList',
      'justifyLeft',
      'justifyRight',
      'justifyCenter',
      '|',
      'uploadImage',
      'insertTable',
      '|',
      'undo',
      'redo',
      'clearStyle',
      'fullScreen',
    ],
  };

  const editorConfig: Partial<IEditorConfig> = {
    placeholder: props.placeholder,
    autoFocus: false,
    readOnly: props.disabled,
    MENU_CONF: {
      uploadImage: {
        maxFileSize: 5 * 1024 * 1024,
        allowedFileTypes: ['image/*'],
        async customUpload(
          file: File,
          insertFn: (url: string, alt?: string, href?: string) => void
        ) {
          try {
            const { data } = await uploadFile(file, props.uploadFolder);
            const url = resolveApiUrl(data.proxyUrl);
            insertFn(url, data.fileName || file.name, url);
          } catch {
            Message.error('图片上传失败');
          }
        },
      },
    },
  };

  watch(
    () => props.value,
    (newValue) => {
      if (newValue !== valueHtml.value) {
        valueHtml.value = newValue || '<p></p>';
      }
    }
  );

  watch(
    () => props.disabled,
    (disabled) => {
      const editor = editorRef.value;
      if (!editor) return;
      if (disabled) {
        editor.disable();
      } else {
        editor.enable();
      }
    }
  );

  const handleCreated = (editor: IDomEditor) => {
    editorRef.value = editor;
    if (props.value) {
      editor.setHtml(props.value);
    }
    if (props.disabled) {
      editor.disable();
    }
  };

  const handleChange = () => {
    emits('update:value', valueHtml.value);
  };

  onMounted(() => {
    valueHtml.value = props.value || '<p></p>';
  });

  onBeforeUnmount(() => {
    const editor = editorRef.value;
    if (editor == null) return;
    editor.destroy();
  });
</script>

<style lang="less">
  @import '@/styles/rich.text.less';

  .widget-rich-text {
    border: 1px solid var(--color-fill-2);
    border-radius: var(--border-radius-small);
    font-size: 14px;
    color: var(--color-text-3);
    width: 100%;

    .toolbar {
      border-bottom: 1px solid var(--color-fill-2);
    }

    .editor {
      background-color: var(--color-fill-2);

      &:hover {
        background-color: var(--color-fill-3);
      }

      [data-slate-editor] {
        min-height: 200px;
        padding: 4px 10px;
        border: 1px solid transparent;

        &:focus {
          background-color: #fff;
          border: 1px solid rgb(var(--primary-6));
        }

        [data-slate-node='element'] {
          margin-top: 0;
        }
      }
    }
  }
</style>
