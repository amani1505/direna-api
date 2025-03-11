import { PaginationOptions } from '@interface/pagination-option.interface';
import { NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PaginationInterface } from '@interface/pagination.interface';
import { SelectQueryBuilder } from 'typeorm';

/**
 * Utility function to apply filters, sorting, and pagination to a TypeORM query builder.
 * @template T Entity type for the query.
 * @param queryBuilder TypeORM query builder to which filters and pagination will be applied.
 * @param query PaginationOptions including filters, sorting, and pagination details.
 * @param validRelations Array of valid relation names for validation (optional).
 * @param entityAlias Alias for the entity in the query (default: 'entity').
 * @returns Paginated results or all matching entities.
 * @throws HttpException if an error occurs during execution.
 */
export async function applyFiltersAndPagination<T>(
  queryBuilder: SelectQueryBuilder<T>,
  query: PaginationOptions,
  validRelations: string[] = [],
  entityAlias: string = 'entity',
): Promise<PaginationInterface<T> | T[]> {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy, // Removed default value
      sortOrder, // Removed default value
      search = '',
      filterBy = '',
      withPagination = false,
    } = query;

    // Apply filters
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

    // Apply sorting dynamically
    if (sortBy && sortOrder) {
      queryBuilder.orderBy(
        `${entityAlias}.${sortBy}`,
        sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      );
    } else {
      throw new NotFoundException(
        'Sorting parameters (sortBy, sortOrder) are required',
      );
    }

    // Handle with/without pagination
    if (withPagination) {
      queryBuilder.skip((page - 1) * limit).take(limit);
      const [data, total] = await queryBuilder.getManyAndCount();

      // Return paginated results
      return {
        data,
        limit,
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
      };
    } else {
      const data = await queryBuilder.getMany();

      // Return all matching entities
      return data;
    }
  } catch (error) {
    // Handle specific errors
    if (error instanceof NotFoundException) {
      throw error; // Re-throw NotFoundException as is
    }

    // Handle other errors
    throw new HttpException(
      {
        message: 'Failed to apply filters and pagination',
        error: error.message || 'Internal Server Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
