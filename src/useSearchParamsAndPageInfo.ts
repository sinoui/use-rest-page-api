/* eslint-disable no-restricted-globals */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import qs from 'qs';
import { Options, SortInfo } from './types';

/**
 * 从history中获取查询参数
 */
function getSearchParamsFromLocation() {
  const { search } = window.location;

  if (search && search.length > 1) {
    return qs.parse(window.location.search.substr(1));
  }
  return null;
}

function parseIntFromStr(str: string, defaultValue: number) {
  return str && !isNaN(parseInt(str, 10)) ? parseInt(str, 10) : defaultValue;
}

/**
 * 获取查询条件和分页信息
 *
 * @param defaultSearchParams
 * @param defaultPageInfo
 */
export function getSearchParamsAndPageInfo(
  defaultSearchParams: { [x: string]: any } | undefined,
  defaultPageInfo: {
    pageNo: number;
    pageSize: number;
    sorts?: SortInfo[];
  },
  syncToUrl: boolean | undefined,
): [
  { [x: string]: any } | undefined,
  { pageNo: number; pageSize: number; sorts?: SortInfo[] },
] {
  if (syncToUrl) {
    const searchParams = getSearchParamsFromLocation();
    if (!searchParams) {
      return [defaultSearchParams, defaultPageInfo];
    }
    const {
      pageSize,
      pageNo,
      sorts,
      ...searchParamsFromLocation
    } = searchParams;
    return [
      searchParamsFromLocation,
      {
        pageSize: parseIntFromStr(pageSize as string, defaultPageInfo.pageSize),
        pageNo: parseIntFromStr(pageNo as string, defaultPageInfo.pageNo),
        sorts: (pageSize || pageNo || sorts
          ? sorts
          : defaultPageInfo.sorts) as any, // 只要url查询参数中包含任何一个分页字段，则表示之前做过分页信息同步到url，这时总是从url中取排序信息。
      },
    ];
  }
  return [defaultSearchParams, defaultPageInfo];
}

/**
 * 解析出默认的查询条件和分页信息的hook
 *
 * @param options
 */
function useSearchParamsAndPageInfo<T>(options: Options<T>) {
  return useMemo(() => {
    return getSearchParamsAndPageInfo(
      options.defaultSearchParams,
      {
        pageSize: options.pageSize || 15,
        pageNo: options.pageNo || 0,
        sorts: options.defaultSort,
      },
      options.syncToUrl,
    );
  }, [
    options.defaultSearchParams,
    options.defaultSort,
    options.pageNo,
    options.pageSize,
    options.syncToUrl,
  ]);
}

export default useSearchParamsAndPageInfo;
