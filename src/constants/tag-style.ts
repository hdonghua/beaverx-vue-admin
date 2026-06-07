export interface TagStyleOption {
  value: string;
  label: string;
}

/** Arco Design Tag 预设颜色 */
export const TAG_STYLE_OPTIONS: TagStyleOption[] = [
  { value: 'gray', label: '灰色' },
  { value: 'red', label: '红色' },
  { value: 'orangered', label: '橙红' },
  { value: 'orange', label: '橙色' },
  { value: 'gold', label: '金色' },
  { value: 'lime', label: '青柠' },
  { value: 'green', label: '绿色' },
  { value: 'cyan', label: '青色' },
  { value: 'blue', label: '蓝色' },
  { value: 'arcoblue', label: 'Arco 蓝' },
  { value: 'purple', label: '紫色' },
  { value: 'pink', label: '粉色' },
  { value: 'magenta', label: '品红' },
];

export function getTagStyleLabel(value?: string | null) {
  if (!value) {
    return '';
  }
  return TAG_STYLE_OPTIONS.find((item) => item.value === value)?.label ?? value;
}
