import { useEffect, useReducer } from 'react';
import qs from 'qs';
import { query } from './apis';
import { PageResponse, Options, SortInfo } from './types';
import dataFetchReducer from './dataFetchReducer';

function useRestPageApi<T>(
  url: string,
  defaultValue: T[] = [],
  options?: Options,
) {
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isError: false,
    isLoading: false,
    items: defaultValue,
    pagenation: {
      pageSize: (options && options.pageSize) || 15,
      pageNo: (options && options.pageNo) || 0,
      totalElements: defaultValue.length || 0,
      sorts: (options && options.sorts) || [],
    },
  });

  function getSearchParams(
    pageNo: number = 0,
    size: number,
    sorts?: SortInfo[],
  ) {
    return qs.stringify(
      {
        page: pageNo,
        size,
        sort: sorts
          ? sorts.map(
              (_sort) =>
                `${_sort.property}${_sort.direction === 'desc' ? '_desc' : ''}`,
            )
          : undefined,
      },
      {
        arrayFormat: 'comma',
      },
    );
  }

  useEffect(() => {
    const fetch = async (): Promise<PageResponse<T>> => {
      dispatch({ type: 'FETCH_INIT' });

      const params = getSearchParams(
        state.pagenation.pageNo,
        state.pagenation.pageSize,
        state.pagenation.sorts,
      );

      try {
        const result = await query<PageResponse<T>>(
          url.includes('?') ? `${url}&${params}` : `${url}?${params}`,
        );

        dispatch({
          type: 'FETCH_SUCCESS',
          payload: result,
        });

        return result;
      } catch (e) {
        dispatch({ type: 'FETCH_FAILURE' });
        throw e;
      }
    };

    fetch();
  }, [
    state.pagenation.pageNo,
    state.pagenation.pageSize,
    state.pagenation.sorts,
    url,
  ]);

  return {
    ...state,
  };
}

export default useRestPageApi;
