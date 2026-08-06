export interface Msg<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

export interface ApiResponse<T = unknown> {
  code?: number;
  msg?: string;
  data: T;
  traceId?: string;
  timestamp?: number;
  details?: unknown;
}

export type HttpResponse<T = unknown> = ApiResponse<T>;
