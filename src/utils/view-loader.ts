/** 按后端 component 动态加载 views（menuFromServer 无需在前端 routes 预定义） */
const viewModules = import.meta.glob('@/views/**/*.vue');

export function normalizeViewComponentKey(
  component?: string | null
): string | undefined {
  if (!component?.trim()) {
    return undefined;
  }
  return component.trim().replace(/^\/+/, '').replace(/\\/g, '/');
}

export function resolveViewLoader(component?: string | null) {
  const key = normalizeViewComponentKey(component);
  if (!key) {
    return undefined;
  }

  const normalizedKey = key.replace(/\.vue$/i, '');
  const matchKey = Object.keys(viewModules).find((filePath) => {
    const normalized = filePath.replace(/\\/g, '/');
    return (
      normalized.endsWith(`/views/${normalizedKey}.vue`) ||
      normalized.endsWith(`/${normalizedKey}.vue`)
    );
  });

  if (!matchKey) {
    return undefined;
  }

  return viewModules[matchKey];
}

export function hasViewComponent(component?: string | null) {
  return !!resolveViewLoader(component);
}
