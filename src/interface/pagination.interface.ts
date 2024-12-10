export interface PaginationInterface<T> {
  data: Array<T>;
  limit: number;
  current_page: number;
  total_pages: number;
  total_items: number;
}
