import { z } from 'zod';
import { PAGINATION } from '../../config/constants';

export const paginationQuerySchema = z.object({
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.MAX_PAGE_SIZE)
    .default(PAGINATION.DEFAULT_PAGE_SIZE),
  cursor: z.string().min(1).optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export function parsePaginationQuery(query: unknown): PaginationQuery {
  return paginationQuerySchema.parse(query);
}
