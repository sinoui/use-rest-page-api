/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useReducer, useCallback, useRef, useMemo } from 'react';
import http from '@sinoui/http';
import { PageResponse, Options, SortInfo, RestPageResponseInfo } from './types';
import reducer, { Reducer } from './reducer';
import getSearchParams from './getSearchParams';
import useEffect2 from './useEffect2';
import useSearchParamsAndPageInfo from './useSearchParamsAndPageInfo';
import useSyncToHistory from './useSyncToHistory';

/**
 * 简化分页列表与RESTful CRUD API交互的状态管理的Hook
 *
 * @template T
 * @template RawResponse
 * @param {string} url 获取数据的url
 * @param {T[]} [defaultValue=[]] 默认列表数据
 * @param {Options<T>} [options] 配置项
 * @returns
 */
function useRestPageApi<T, RawResponse = any>(
  url: string,
  defaultValue: T[] = [],
  options: Options<T> = {},
): RestPageResponseInfo<T, RawResponse> {
  const rawResponseRef = useRef<RawResponse>();

  const {
    keyName = 'id',
    baseUrl = url,
    transformListRequest,
    transformListResponse,
    transformFetchOneResponse,
    transformSaveRequest,
    transformSaveResponse,
    transformUpdateRequest,
    transformUpdateResponse,
    transformRemoveResponse,
    useMultiDeleteApi = true,
  } = options;

  const [defaultSearchParams, pageInfo] = useSearchParamsAndPageInfo(options);
  const defaultSearchParamsRef = useRef<{ [x: string]: any } | undefined>(
    defaultSearchParams,
  );

  defaultSearchParamsRef.current = defaultSearchParams;

  const defaultPagination = useMemo(
    () => ({
      ...pageInfo,
      totalElements: defaultValue.length || 0,
      totalPages:
        Math.ceil((defaultValue.length || 0) / (options.pageSize || 15)) || 0,
    }),
    [defaultValue.length, options.pageSize, pageInfo],
  );

  const [state, dispatch] = useReducer<Reducer<T>>(reducer, {
    isError: false,
    isLoading: false,
    items: defaultValue,
    pagination: defaultPagination,
    searchParams: defaultSearchParamsRef.current,
    selectIds: [],
    keyName,
  });

  useSyncToHistory(options.syncToUrl, state);

  const doFetch = useCallback(
    async (
      pageNo: number,
      pageSize: number,
      sorts?: SortInfo[],
      searchParams?: { [x: string]: string },
    ): Promise<PageResponse<T>> => {
      dispatch({ type: 'FETCH_INIT', payload: searchParams });

      try {
        const params = transformListRequest
          ? transformListRequest(searchParams, { pageNo, pageSize, sorts })
          : getSearchParams(pageNo, pageSize, sorts, searchParams);
        const response = await http.get<PageResponse<T>>(
          url.indexOf('?') !== -1 ? `${url}&${params}` : `${url}?${params}`,
        );

        const result = transformListResponse
          ? await transformListResponse(response)
          : response;

        rawResponseRef.current = response as any;

        dispatch({
          type: 'FETCH_SUCCESS',
          payload: { ...result, sorts, number: pageNo, size: pageSize },
        });

        return result;
      } catch (e) {
        dispatch({ type: 'FETCH_FAILURE' });
        throw e;
      }
    },
    [transformListResponse, transformListRequest, url],
  );

  useEffect2(() => {
    if (url) {
      doFetch(
        defaultPagination.pageNo,
        defaultPagination.pageSize,
        defaultPagination.sorts,
        defaultSearchParamsRef.current,
      );
    }
  }, [url]);

  /**
   * 获取数据
   *
   * @param {number} pageNo 页码
   * @returns
   */
  function fetch(
    pageNo: number = state.pagination.pageNo,
    pageSize: number = state.pagination.pageSize,
    sorts: SortInfo[] | undefined = state.pagination.sorts,
    searchParams: { [x: string]: string } | undefined = state.searchParams,
  ): Promise<PageResponse<T>> {
    return doFetch(pageNo, pageSize, sorts, searchParams);
  }

  /**
   * 获取下一页数据
   *
   * @returns
   */
  const nextPage = useCallback(() => {
    const { pageNo, pageSize, totalElements, sorts } = state.pagination;
    const totalPages = Math.ceil(totalElements / pageSize);

    return doFetch(Math.min(totalPages - 1, pageNo + 1), pageSize, sorts);
  }, [doFetch, state.pagination]);

  /**
   * 获取上一页数据
   *
   * @returns
   */
  const prevPage = useCallback(() => {
    const { pageNo, pageSize, sorts } = state.pagination;

    return doFetch(Math.max(0, pageNo - 1), pageSize, sorts);
  }, [doFetch, state.pagination]);

  /**
   * 列表排序
   *
   * @param {SortInfo[]} sorts
   * @returns {Promise<PageResponse<T>>}
   */
  const sortWith = useCallback(
    (sorts: SortInfo[]) =>
      doFetch(
        state.pagination.pageNo,
        state.pagination.pageSize,
        sorts,
        state.searchParams,
      ),
    [
      doFetch,
      state.pagination.pageNo,
      state.pagination.pageSize,
      state.searchParams,
    ],
  );

  /**
   * 获取指定id的数据
   *
   * @param {string} itemId
   * @returns {T}
   */
  function getItemById(itemId: string): T | undefined {
    return state.items.find((item: any) => item[keyName] === itemId);
  }

  /**
   * 更新数据
   *
   * @param {T} item
   * @returns {T}
   */
  const updateItem = useCallback(
    (item: T) => {
      dispatch({ type: 'UPDATE_ITEM', payload: { item, keyName } });

      return item;
    },
    [keyName],
  );

  /**
   * 更新指定数据的部分字段
   *
   * @param {string} itemId 数据key值
   * @param {T} itemInfo 要更新的字段信息
   * @returns {T}
   */
  const setItem = useCallback(
    (itemId: string, itemInfo: T) => {
      dispatch({
        type: 'SET_ITEM',
        payload: { extraItemInfo: itemInfo, keyName, itemId },
      });
    },
    [keyName],
  );

  /**
   * 替换数据
   *
   * @param {T[]} itemsInfo
   */
  const setItems = useCallback((itemsInfo: T[]) => {
    dispatch({ type: 'SET_ITEMS', payload: itemsInfo });
  }, []);

  /**
   * 新增一条列表数据
   *
   * @param {T} item
   */
  const addItem = useCallback((item: T) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: item,
    });
  }, []);

  /**
   * 根据id删除一条数据
   *
   * @param {string} itemId
   */
  const removeItemById = useCallback(
    (itemId: string) => {
      dispatch({
        type: 'REMOVE_ITEM_BY_ID',
        payload: { itemIds: [itemId], keyName },
      });
    },
    [keyName],
  );

  /**
   * 删除指定行的数据
   *
   * @param {number} index
   */
  const removeItemAt = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: [index] });
  }, []);

  /**
   * 删除多条数据
   *
   * @param {string[]} ids
   */
  const removeItemsByIds = useCallback(
    (ids: string[]) => {
      dispatch({
        type: 'REMOVE_ITEM_BY_ID',
        payload: { itemIds: ids, keyName },
      });
    },
    [keyName],
  );

  /**
   * 清空列表数据
   *
   */
  const clean = useCallback(() => {
    dispatch({ type: 'CLEAN_ITEMS' });
  }, []);

  /**
   * 重新加载数据
   *
   * @returns
   */
  const reload = useCallback(() => {
    const { pageNo, pageSize, sorts } = state.pagination;
    return doFetch(pageNo, pageSize, sorts, state.searchParams);
  }, [doFetch, state.pagination, state.searchParams]);

  /**
   * 获取一条数据详情信息
   *
   * @param {string} id
   * @param {boolean} [isNeedUpdate=true]
   * @returns {Promise<T>}
   */
  const get = useCallback(
    async (id: string, isNeedUpdate = true): Promise<T> => {
      try {
        const response: T = await http.get(`${baseUrl}/${id}`);
        const result = transformFetchOneResponse
          ? transformFetchOneResponse(response)
          : response;

        if (isNeedUpdate) {
          updateItem(result);
        }

        return result;
      } catch (error) {
        throw error;
      }
    },
    [baseUrl, transformFetchOneResponse, updateItem],
  );

  /**
   * 新增数据
   *
   * @param {T} itemInfo
   * @param {boolean} [isNeedUpdate=true]
   * @returns {Promise<T>}
   */
  const save = useCallback(
    async (itemInfo: T, isNeedUpdate = true): Promise<T> => {
      try {
        const info = transformSaveRequest
          ? transformSaveRequest(itemInfo)
          : itemInfo;
        const response: T = await http.post(baseUrl, info);
        const result = transformSaveResponse
          ? transformSaveResponse(response)
          : response;

        if (isNeedUpdate) {
          addItem(result);
          reload();
        }

        return result;
      } catch (error) {
        throw error;
      }
    },
    [addItem, baseUrl, reload, transformSaveRequest, transformSaveResponse],
  );

  /**
   * 更新数据信息
   *
   * @param {T} itemInfo
   * @param {boolean} [isNeedUpdate=true]
   * @returns {Promise<T>}
   */
  const update = useCallback(
    async (itemInfo: T, isNeedUpdate = true): Promise<T> => {
      try {
        const info: any = transformUpdateRequest
          ? transformUpdateRequest(itemInfo)
          : itemInfo;
        const response: T = await http.put(`${baseUrl}/${info[keyName]}`, info);

        const result = transformUpdateResponse
          ? transformUpdateResponse(response)
          : response;

        if (isNeedUpdate) {
          updateItem(result);
        }

        return result;
      } catch (error) {
        throw error;
      }
    },
    [
      baseUrl,
      keyName,
      transformUpdateRequest,
      transformUpdateResponse,
      updateItem,
    ],
  );

  /**
   * 删除数据
   *
   * @param {(string | string[])} ids
   * @param {boolean} [isNeedUpdate=true]
   * @returns {Promise<T>}
   */
  const remove = useCallback(
    async (ids: string | string[], isNeedUpdate = true) => {
      try {
        if (typeof ids !== 'string') {
          if (useMultiDeleteApi) {
            const response: T = await http.delete(
              `${baseUrl}/${ids.join(',')}`,
            );

            if (transformRemoveResponse) {
              transformRemoveResponse(response);
            }

            if (isNeedUpdate) {
              removeItemsByIds(ids);
              reload();
            }
          }
        } else {
          const response: T = await http.delete(`${baseUrl}/${ids}`);

          if (transformRemoveResponse) {
            transformRemoveResponse(response);
          }

          if (isNeedUpdate) {
            removeItemById(ids as string);
            reload();
          }
        }
      } catch (error) {
        throw error;
      }
    },
    [
      baseUrl,
      reload,
      removeItemById,
      removeItemsByIds,
      transformRemoveResponse,
      useMultiDeleteApi,
    ],
  );

  /**
   * 查询数据
   *
   * @param {{ [x: string]: string }} searchParams
   * @returns
   */
  const query = useCallback(
    (searchParams: { [x: string]: string }) => {
      const { pageSize, sorts } = state.pagination;

      return doFetch(0, pageSize, sorts, searchParams);
    },
    [doFetch, state.pagination],
  );

  /**
   * 重置查询条件并完成一次查询
   *
   * @returns
   */
  const reset = useCallback(() => {
    const { pageNo, pageSize, sorts } = state.pagination;
    return doFetch(pageNo, pageSize, sorts, defaultSearchParamsRef.current);
  }, [doFetch, state.pagination]);

  /**
   * 设置默认查询条件并完成一次查询
   *
   * @returns
   */
  const setDefaultSearchParams = useCallback(
    (searchParams: { [x: string]: string }) => {
      defaultSearchParamsRef.current = searchParams;
      return query(searchParams);
    },
    [query],
  );

  const toggleSelect = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_SELECT_ITEM', payload: { id } });
  }, []);

  const toggleSelectAll = useCallback(() => {
    dispatch({ type: 'TOGGLE_SELECT_ALL' });
  }, []);

  return {
    ...state,
    keyName,
    rawResponse: rawResponseRef.current,
    fetch,
    nextPage,
    prevPage,
    sortWith,
    getItemById,
    updateItem,
    setItem,
    setItems,
    addItem,
    removeItemById,
    removeItemAt,
    removeItemsByIds,
    get,
    save,
    update,
    remove,
    defaultSearchParams: defaultSearchParamsRef.current,
    query,
    reload,
    reset,
    clean,
    setDefaultSearchParams,
    toggleSelectAll,
    toggleSelect,
  };
}

export default useRestPageApi;
