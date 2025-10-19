export interface BaseRepository<T> {
  create(entity: Omit<T, 'id'>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  findWhere(field: string, operator: any, value: any): Promise<T[]>;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface RepositoryResult<T> {
  data: T | T[] | null;
  error: string | null;
  success: boolean;
}
