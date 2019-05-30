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
 * useRestPageApi配置信息
 */
export interface Options {
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
  transformListReponse?: (response: HttpResponse) => void;
  /**
   * 指定分页查询条件转换器
   */
  transformListRequest?: (request: HttpRequestConfig) => void;
  /**
   * 指定获取单条数据的请求数据转换器
   */
  transformFetchOneRequest?: (response: HttpResponse) => void;
  /**
   * 指定获取单条数据的响应数据转换器
   */
  transformFetchOneResponse?: (response: HttpRequestConfig) => void;
  /**
   * 指定新增数据的请求数据转换器
   */
  transformSaveRequest?: (request: HttpRequestConfig) => void;
  /**
   * 指定新增数据的响应数据转换器
   */
  transformSaveResponse?: (response: HttpResponse) => void;
  /**
   * 指定更新数据的请求数据转换器
   */
  transformUpdateRequest?: (request: HttpRequestConfig) => void;
  /**
   * 指定更新数据的响应数据转换器
   */
  transformUpdateResponse?: (response: HttpResponse) => void;
}
