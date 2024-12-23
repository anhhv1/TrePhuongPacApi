export interface PaginationResponse<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  totalPage: number;
}
