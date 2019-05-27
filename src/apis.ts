import http from '@sinoui/http';
// import { PageInterface } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function query<T>(url: string): Promise<T> {
  return http.get(url);
}

export function update() {}
