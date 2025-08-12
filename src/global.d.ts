declare global {
  type RepoPromise<T> = Promise<T | undefined>;
}

declare module '*.css' {
  const content: string;
  export default content;
}

export {};
