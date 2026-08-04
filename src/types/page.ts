export interface QueryPageRequest {
  current: number;
  pageSize: number;
}

export interface PagedResultDto<T> {
  total: number;
  totalCount?: number;
  items: T[];
}
