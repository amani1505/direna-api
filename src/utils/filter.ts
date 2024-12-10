import { NotFoundException } from '@nestjs/common';
import { PaginationInterface } from 'src/interfaces/pagination.interface';
import { SelectQueryBuilder } from 'typeorm';

interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  filterBy?: string;
  withPagination?: boolean;
}

export async function applyFiltersAndPagination<T>(
  queryBuilder: SelectQueryBuilder<T>,
  query: PaginationOptions,
  validRelations: string[] = [],
  entityAlias: string = 'entity',
): Promise<PaginationInterface<T> | T[]> {
  const {
    page = 1,
    limit = 10,
    sortBy = 'city',
    sortOrder = 'ASC',
    search = '',
    filterBy = '',
    withPagination = false,
  } = query;

  if (filterBy && search) {
    if (process.env.DB_TYPE === 'mysql') {
      queryBuilder.where(`${entityAlias}.${filterBy} LIKE :search`, {
        search: `%${search}%`,
      });
    } else {
      queryBuilder.where(`${entityAlias}.${filterBy} ILIKE :search`, {
        search: `%${search}%`,
      });
    }
  }

  // Apply sorting
  queryBuilder.orderBy(
    `${entityAlias}.${sortBy}`,
    sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
  );

  // Handle with/without pagination
  if (withPagination) {
    queryBuilder.skip((page - 1) * limit).take(limit);
    const [data, total] = await queryBuilder.getManyAndCount();

    if (data.length === 0) {
      throw new NotFoundException(
        'No items found matching the search criteria',
      );
    }

    return {
      data,
      limit,
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_items: total,
    };
  } else {
    const data = await queryBuilder.getMany();

    if (data.length === 0) {
      throw new NotFoundException(
        'No items found matching the search criteria',
      );
    }

    return data;
  }
}
