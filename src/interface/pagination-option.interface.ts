export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  filterBy?: string;
  withPagination?: boolean;
  relations?: string[];
}
