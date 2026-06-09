/** 将后端返回的相对资源路径转为可访问的完整 URL */
export function resolveApiUrl(path?: string | null): string {
  const value = path?.trim();
  if (!value) {
    return '';
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  if (!baseUrl) {
    return value.startsWith('/') ? value : `/${value}`;
  }
  return value.startsWith('/') ? `${baseUrl}${value}` : `${baseUrl}/${value}`;
}
