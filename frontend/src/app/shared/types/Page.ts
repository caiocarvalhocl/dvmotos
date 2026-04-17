/**
 * Representa uma página de resultados do Spring Data (Pageable).
 * Usado em todos os endpoints paginados do backend.
 */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
