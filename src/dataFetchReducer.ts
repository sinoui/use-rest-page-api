import { PageInfo } from './types';

export interface Action {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

export interface State<T> {
  isError: boolean;
  isLoading: boolean;
  items: T[];
  pagenation: PageInfo;
}

/**
 * 获取数据的reducer
 *
 * @param state 状态
 * @param action 动作
 */
function dataFetchReducer<T>(state: State<T>, action: Action) {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isError: false,
        isLoading: true,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        items: action.payload.result
          ? [...state.items, ...action.payload.result.content]
          : [...state.items],
        pagenation: action.payload.result
          ? {
              ...state.pagenation,
              pageNo: action.payload.result.number,
              pageSize: action.payload.result.size,
              totalElements: action.payload.result.totalElements,
            }
          : { ...state.pagenation },
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isError: true,
        isLoading: false,
      };
    default:
      return state;
  }
}

export default dataFetchReducer;
