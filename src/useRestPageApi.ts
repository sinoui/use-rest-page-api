import { useReducer, useCallback, useRef, useEffect } from 'react';
import http from '@sinoui/http';
import qs from 'qs';
import { PageResponse, Options, SortInfo, RestPageResponseInfo } from './types';
import reducer from './reducer';
import getSearchParams from './getSearchParams';
import useEffect2 from './useEffect2';

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
function useRestPageApi<T, RawResponse = PageResponse<T>>(
  url: string,
  defaultValue: T[] = [],
  options: Options<T> = {},
): RestPageResponseInfo<T, RawResponse> {
  const rawResponseRef = useRef<RawResponse>();

  const {
    keyName = 'id',
    syncToUrl,
    defaultSearchParams,
    baseUrl = url,
    transformListRequest,
    transformListReponse,
    transformFetchOneResponse,
    transformSaveRequest,
    transformSaveResponse,
    transformUpdateRequest,
    transformUpdateResponse,
  } = (options || {}) as Options<T>;

  const defaultPagination = {
    pageSize: options.pageSize || 15,
    pageNo: options.pageNo || 0,
    totalElements: defaultValue.length || 0,
    sorts: options.defaultSort,
  };
  const [state, dispatch] = useReducer(reducer, {
    isError: false,
    isLoading: false,
    items: defaultValue,
    pagination: defaultPagination,
    searchParams: syncToUrl
      ? getSearchParamsFromLocation() || defaultSearchParams
      : defaultSearchParams,
  });

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
          url.includes('?') ? `${url}&${params}` : `${url}?${params}`,
        );

        const result = transformListReponse
          ? transformListReponse(response as any)
          : response;

        dispatch({
          type: 'FETCH_SUCCESS',
          payload: { ...result, sorts },
        });

        rawResponseRef.current = result as any;
        return result;
      } catch (e) {
        dispatch({ type: 'FETCH_FAILURE' });
        throw e;
      }
    },
    [transformListReponse, transformListRequest, url],
  );

  useEffect2(() => {
    const searchParams = syncToUrl
      ? getSearchParamsFromLocation() || defaultSearchParams
      : defaultSearchParams;
    doFetch(
      defaultPagination.pageNo,
      defaultPagination.pageSize,
      defaultPagination.sorts,
      searchParams,
    );
  }, [url]);

  useEffect(() => {
    if (!syncToUrl) {
      return;
    }
    const search = `?${qs.stringify(state.searchParams)}`;
    if (search !== window.location.search) {
      window.history.pushState(window.history.state, document.title, search);
    }
  }, [state.searchParams, syncToUrl]);

  /**
   * 获取数据
   *
   * @param {number} pageNo 页码
   * @returns
   */
  function fetch(
    pageNo: number = state.pagination.pageNo,
    pageSize: number = state.pagination.pageSize,
    sorts: SortInfo[] = state.pagination.sorts,
    searchParams: { [x: string]: string } = state.searchParams,
  ): Promise<PageResponse<T>> {
    return doFetch(pageNo, pageSize, sorts, searchParams);
  }

  /**
   * 获取下一页数据
   *
   * @returns
   */
  function nextPage(): Promise<PageResponse<T>> {
    const { pageNo, pageSize, totalElements, sorts } = state.pagination;
    const totalPages = Math.ceil(totalElements / pageSize);

    return doFetch(Math.min(totalPages - 1, pageNo + 1), pageSize, sorts);
  }

  /**
   * 获取上一页数据
   *
   * @returns
   */
  function prevPage(): Promise<PageResponse<T>> {
    const { pageNo, pageSize, sorts } = state.pagination;

    return doFetch(Math.max(0, pageNo - 1), pageSize, sorts);
  }

  /**
   * 列表排序
   *
   * @param {SortInfo[]} sorts
   * @returns {Promise<PageResponse<T>>}
   */
  function sortWith(sorts: SortInfo[]): Promise<PageResponse<T>> {
    return doFetch(state.pagination.pageNo, state.pagination.pageSize, sorts);
  }

  /**
   * 获取指定id的数据
   *
   * @param {string} itemId
   * @returns {T}
   */
  function getItemById(itemId: string): T {
    return state.items.find((item: any) => item[keyName] === itemId);
  }

  /**
   * 更新数据
   *
   * @param {T} item
   * @returns {T}
   */
  function updateItem(item: T): T {
    dispatch({ type: 'UPDATE_ITEM', payload: { item, keyName } });

    return item;
  }

  /**
   * 更新指定数据的部分字段
   *
   * @param {string} itemId 数据key值
   * @param {T} itemInfo 要更新的字段信息
   * @returns {T}
   */
  function setItem(itemId: string, itemInfo: T): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item = state.items.find((data: any) => data[keyName] === itemId);
    const newItem = { ...item, ...itemInfo };

    dispatch({
      type: 'UPDATE_ITEM',
      payload: { item: newItem, keyName },
    });

    return newItem;
  }
  /**
   * 替换数据
   *
   * @param {T[]} itemsInfo
   */
  function setItems(itemsInfo: T[]) {
    dispatch({ type: 'SET_ITEMS', payload: itemsInfo });
  }

  /**
   * 新增一条列表数据
   *
   * @param {T} item
   */
  function addItem(item: T) {
    dispatch({
      type: 'ADD_ITEM',
      payload: item,
    });
  }
  /**
   * 根据id删除一条数据
   *
   * @param {string} itemId
   */
  function removeItemById(itemId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const idx = state.items.findIndex((item: any) => item[keyName] === itemId);
    dispatch({ type: 'REMOVE_ITEM', payload: [idx] });
  }

  /**
   * 删除指定行的数据
   *
   * @param {number} index
   */
  function removeItemAt(index: number) {
    dispatch({ type: 'REMOVE_ITEM', payload: [index] });
  }

  /**
   * 删除多条数据
   *
   * @param {string[]} ids
   */
  function removeItemsByIds(ids: string[]) {
    const idxs = ids.map((id) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      state.items.findIndex((item: any) => item[keyName] === id),
    );
    dispatch({ type: 'REMOVE_ITEM', payload: idxs });
  }

  /**
   * 清空列表数据
   *
   */
  function clean() {
    dispatch({ type: 'CLEAN_ITEMS' });
  }

  /**
   * 获取一条数据详情信息
   *
   * @param {string} id
   * @param {boolean} [isNeedUpdate=true]
   * @returns {Promise<T>}
   */
  async function get(id: string, isNeedUpdate: boolean = true): Promise<T> {
    try {
      const response: T = await http.get(`${baseUrl}/${id}`);
      const result = transformFetchOneResponse
        ? transformFetchOneResponse(response as any)
        : response;

      if (isNeedUpdate) {
        updateItem(result);
      }

      return result;
    } catch (error) {
      throw error;
    }
  }
  /**
   * 新增数据
   *
   * @param {T} itemInfo
   * @param {boolean} [isNeedUpdate=true]
   * @returns {Promise<T>}
   */
  async function save(itemInfo: T, isNeedUpdate: boolean = true): Promise<T> {
    try {
      const info = transformSaveRequest
        ? transformSaveRequest(itemInfo)
        : itemInfo;
      const response: T = await http.post(baseUrl, info);
      const result = transformSaveResponse
        ? transformSaveResponse(response as any)
        : response;

      if (isNeedUpdate) {
        addItem(result);
      }

      return result;
    } catch (error) {
      throw error;
    }
  }
  /**
   * 更新数据信息
   *
   * @param {T} itemInfo
   * @param {boolean} [isNeedUpdate=true]
   * @returns {Promise<T>}
   */
  async function update(itemInfo: T, isNeedUpdate: boolean = true): Promise<T> {
    try {
      const info = transformUpdateRequest
        ? transformUpdateRequest(itemInfo)
        : itemInfo;
      const response: T = await http.put(baseUrl, info);

      const result = transformUpdateResponse
        ? transformUpdateResponse(response as any)
        : response;

      if (isNeedUpdate) {
        updateItem(result);
      }

      return result;
    } catch (error) {
      throw error;
    }
  }
  /**
   * 删除数据
   *
   * @param {(string | string[])} ids
   * @param {boolean} [isNeedUpdate=true]
   * @returns {Promise<T>}
   */
  async function remove(ids: string | string[], isNeedUpdate: boolean = true) {
    const { useMultiDeleteApi = true } = options || {};

    try {
      if (typeof ids !== 'string') {
        if (useMultiDeleteApi) {
          await http.delete(`${baseUrl}/${ids.join(',')}`);

          if (isNeedUpdate) {
            removeItemsByIds(ids);
          }
        }
      } else {
        await http.delete(`${baseUrl}/${ids}`);

        if (isNeedUpdate) {
          removeItemById(ids as string);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * 查询数据
   *
   * @param {{ [x: string]: string }} searchParams
   * @returns
   */
  function query(searchParams: { [x: string]: string }) {
    const { pageSize, sorts } = state.pagination;

    return doFetch(0, pageSize, sorts, searchParams);
  }

  /**
   * 重新加载数据
   *
   * @returns
   */
  function reload() {
    const { pageNo, pageSize, sorts } = state.pagination;
    return doFetch(pageNo, pageSize, sorts, state.searchParams);
  }

  /**
   * 重置查询条件并完成一次查询
   *
   * @returns
   */
  function reset() {
    const { pageNo, pageSize, sorts } = state.pagination;
    return doFetch(pageNo, pageSize, sorts, defaultSearchParams);
  }

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
    defaultSearchParams,
    query,
    reload,
    reset,
    clean,
  };
}

export default useRestPageApi;
