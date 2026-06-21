export interface ApiResponse<T> {
  meta: ApiMeta;
  data: T;
  pagination: ApiPagination | never[];
}

export interface ApiPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ApiMeta {
  code: number;
  error: ApiError | null;
}

export interface ApiError {
  code: number;
  message: string;
  stack: any;
}
