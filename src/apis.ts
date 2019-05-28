import http from '@sinoui/http';
// import { PageInterface } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line import/prefer-default-export
export function query<T>(url: string): Promise<T> {
  return http.get(url);
}
