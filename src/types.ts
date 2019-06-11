import { HttpRequestConfig, HttpResponse } from '@sinoui/http';
/**
 * 排序信息
 */
export interface SortInfo {
  /**
   * 排序方式，`desc`表示降序，`asc`表示升序
   */
  direction: 'desc' | 'asc';
  /**
   * 指定排序字段
   */
  property: string;
}

/**
 * 分页信息
 *
 * @interface PageInfo
 */
export interface PageInfo {
  /**
   * 一共有多少条数据
   */
  totalElements: number;
  /**
   * 页大小，表示一页有多少条数据
   */
  pageSize: number;
  /**
   * 第几页，从0开始
   */
  pageNo: number;
  /**
   * 排序信息
   */
  sorts?: SortInfo[];
}

/**
 * 列表信息
 *
 * @export
 * @interface PageResponse
 * @template T
 */
export interface PageResponse<T> {
  /**
   * 数据列表
   */
  content: T[];
  /**
   * 总大小
   */
  totalElements: number;
  /**
   * 一页显示多少条结果
   */
  size: number;
  /**
   * 当前是第几页
   */
  number: number;

  /**
   * 总页数，可以没有。如果没有，则等于`Math.ceil(totalElements/size)`。
   */
  totalPages?: number;
}

/**
 * 配置信息
 *
 * @export
 * @interface Options
 * @template T
 */
export interface Options<T> {
  /**
   * 指定`curd api`的基础`url`，如果不指定，则默认为`url`
   */
  baseUrl?: string;
  /**
   * 第几页
   */
  pageNo?: number;
  /**
   * 指定每页条数
   */
  pageSize?: number;
  /**
   * 指定排序字段
   */
  defaultSort?: SortInfo[];
  /**
   * 指定默认查询条件
   */
  defaultSearchParams?: { [x: string]: string };
  /**
   * 是否同步查询条件与浏览器URL，默认为`false`
   */
  syncToUrl?: boolean;
  /**
   * 指定唯一键属性名，默认为`id`
   */
  keyName?: string;
  /**
   * 是否启动删除多条数据的 API。默认为`true`，表示启用。
   */
  useMultiDeleteApi?: boolean;
  /**
   * 指定分页列表查询结果的转换器
   */
  transformListResponse?: (response: HttpResponse) => PageResponse<any>;
  /**
   * 指定分页查询条件转换器
   */
  transformListRequest?: (
    searchParams?: { [x: string]: string },
    pageInfo?: { pageNo: number; pageSize: number; sorts?: SortInfo[] },
  ) => void;
  /**
   * 指定获取单条数据的响应数据转换器
   */
  transformFetchOneResponse?: (response: HttpResponse) => T;
  /**
   * 指定新增数据的请求数据转换器
   */
  transformSaveRequest?: (request: HttpRequestConfig) => T;
  /**
   * 指定新增数据的响应数据转换器
   */
  transformSaveResponse?: (response: HttpResponse) => T;
  /**
   * 指定更新数据的请求数据转换器
   */
  transformUpdateRequest?: (request: HttpRequestConfig) => void;
  /**
   * 指定更新数据的响应数据转换器
   */
  transformUpdateResponse?: (response: HttpResponse) => T;
}

export interface RestPageResponseInfo<T, RawResponse> {
  /**
   * 分页信息
   */
  pagination: PageInfo;
  /**
   * 列表数据
   */
  items: any[];
  /**
   * 是否正在加载
   */
  isLoading: boolean;
  /**
   * 是否加载出错
   */
  isError: boolean;
  /**
   * 关键字，默认为`id`
   */
  keyName: string;
  /**
   * 查询条件
   */
  searchParams?: { [x: string]: string };
  /**
   * 默认查询字段
   */
  defaultSearchParams?: { [x: string]: string };
  /**
   * 原始响应
   */
  rawResponse?: RawResponse;
  /**
   * 获取列表数据
   *
   * @memberof RestPageResponseInfo
   */
  fetch: (
    pageNo?: number,
    pageSize?: number,
    sorts?: SortInfo[],
    searchParams?: { [x: string]: string },
  ) => Promise<PageResponse<T>>;
  /**
   * 获取下一页数据
   */
  nextPage: () => Promise<PageResponse<T>>;
  /**
   * 获取上一页数据
   */
  prevPage: () => Promise<PageResponse<T>>;
  /**
   * 以xx排序
   */
  sortWith: (sorts: SortInfo[]) => Promise<PageResponse<T>>;
  /**
   * 通过id获取一条数据
   */
  getItemById: (itemId: string) => T;
  /**
   * 更新一条数据
   */
  updateItem: (item: T) => T;
  /**
   * 部分更新一条数据
   */
  setItem: (itemId: string, itemInfo: T) => T;
  /**
   * 替换items
   */
  setItems: (itemsInfo: T[]) => void;
  /**
   * 添加一条数据
   */
  addItem: (item: T) => void;
  /**
   * 删除指定id的数据
   */
  removeItemById: (itemId: string) => void;
  /**
   * 删除指定行的数据
   */
  removeItemAt: (index: number) => void;
  /**
   * 删除多条数据
   */
  removeItemsByIds: (ids: string[]) => void;
  /**
   * 清空数据
   */
  clean: () => void;
  /**
   * 获取数据详情
   */
  get: (id: string, isNeedUpdate?: boolean) => Promise<T>;
  /**
   * 创建一条新的数据
   */
  save: (itemInfo: T, isNeedUpdate?: boolean) => Promise<T>;
  /**
   * 更新数据
   */
  update: (itemInfo: T, isNeedUpdate?: boolean) => Promise<T>;
  /**
   * 删除一条数据
   */
  remove: (ids: string | string[], isNeedUpdate?: boolean) => void;
  /**
   * 列表查询
   */
  query: (searchParams: { [x: string]: string }) => void;
  /**
   * 重新加载
   */
  reload: () => void;
  /**
   * 重置
   */
  reset: () => void;
}
