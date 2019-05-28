import { useEffect, useReducer, useCallback, useRef } from 'react';
import http from '@sinoui/http';
import { PageResponse, Options, SortInfo } from './types';
import reducer from './reducer';
import getSearchParams from './getSearchParams';

function useRestPageApi<T>(
  url: string,
  defaultValue: T[] = [],
  options?: Options,
) {
  const defaultPagination = {
    pageSize: (options && options.pageSize) || 15,
    pageNo: (options && options.pageNo) || 0,
    totalElements: defaultValue.length || 0,
    sorts: options && options.sorts,
  };

  const defaultPaginationRef = useRef(defaultPagination);

  const [state, dispatch] = useReducer(reducer, {
    isError: false,
    isLoading: false,
    items: defaultValue,
    pagenation: defaultPagination,
  });

  const doFetch = useCallback(
    async (
      pageNo: number,
      pageSize: number,
      sorts?: SortInfo[],
    ): Promise<PageResponse<T>> => {
      dispatch({ type: 'FETCH_INIT' });

      const params = getSearchParams(pageNo, pageSize, sorts);

      try {
        const result = await http.get<PageResponse<T>>(
          url.includes('?') ? `${url}&${params}` : `${url}?${params}`,
        );

        dispatch({
          type: 'FETCH_SUCCESS',
          payload: { ...result, sorts },
        });

        return result;
      } catch (e) {
        dispatch({ type: 'FETCH_FAILURE' });
        throw e;
      }
    },
    [url],
  );

  useEffect(() => {
    if (defaultPaginationRef.current) {
      doFetch(
        defaultPaginationRef.current.pageNo,
        defaultPaginationRef.current.pageSize,
        defaultPaginationRef.current.sorts,
      );
    }
  }, [doFetch]);

  /**
   * 获取数据
   *
   * @param {number} pageNo 页码
   * @returns
   */
  function fetch(
    pageNo?: number,
    pageSize?: number,
    sorts?: SortInfo[],
  ): Promise<PageResponse<T>> {
    return doFetch(
      pageNo || state.pagenation.pageSize,
      pageSize || state.pagenation.pageSize,
      sorts || state.pagenation.sorts,
    );
  }

  /**
   * 获取下一页数据
   *
   * @returns
   */
  function nextPage(): Promise<PageResponse<T>> {
    const { pageNo, pageSize, totalElements, sorts } = state.pagenation;
    const totalPages = Math.ceil(totalElements / pageSize);

    return doFetch(Math.min(totalPages - 1, pageNo + 1), pageSize, sorts);
  }

  /**
   * 获取上一页数据
   *
   * @returns
   */
  function prevPage(): Promise<PageResponse<T>> {
    const { pageNo, pageSize, sorts } = state.pagenation;

    return doFetch(Math.max(0, pageNo - 1), pageSize, sorts);
  }

  /**
   * 列表排序
   *
   * @param {SortInfo[]} sorts
   * @returns {Promise<PageResponse<T>>}
   */
  function sortWith(sorts: SortInfo[]): Promise<PageResponse<T>> {
    return doFetch(state.pagenation.pageNo, state.pagenation.pageSize, sorts);
  }

  return {
    ...state,
    fetch,
    nextPage,
    prevPage,
    sortWith,
  };
}

export default useRestPageApi;
