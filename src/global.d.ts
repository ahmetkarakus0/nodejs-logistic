declare global {
  type RepoPromise<T> = Promise<T | undefined>;
  type PaginatedResponse<T> = {
    items: T[];
    total: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
  };
}

declare module '*.css' {
  const content: string;
  export default content;
}

export {};
