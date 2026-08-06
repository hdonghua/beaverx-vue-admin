export interface QueryPageRequest {
  current: number;
  pageSize: number;
}

export interface PagedResultDto<T> {
  total: number;
  items: T[];
}
