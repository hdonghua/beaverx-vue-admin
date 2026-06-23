import type { FormInstance } from '@arco-design/web-vue/es/form';
import { nextTick, unref, type MaybeRef } from 'vue';

/** 清除表单校验状态（关闭弹窗、重新打开时调用） */
export function clearFormValidate(formRef?: MaybeRef<FormInstance | undefined>) {
  nextTick(() => {
    unref(formRef)?.clearValidate();
  });
}
