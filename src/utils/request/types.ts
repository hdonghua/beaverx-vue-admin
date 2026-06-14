export interface Msg<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

export interface ApiResponse<T = unknown> {
  data: T;
}

export type HttpResponse<T = unknown> = ApiResponse<T>;
