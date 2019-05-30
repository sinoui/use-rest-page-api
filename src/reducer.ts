/* eslint-disable @typescript-eslint/no-explicit-any */
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
  searchParams?: { [x: string]: string };
}
/**
 * 更新数据时更新state
 *
 * @template T
 * @param {State<T>} state
 * @param {Action} action
 * @returns
 */
function updateItem<T>(state: State<T>, action: Action) {
  const idx = state.items.findIndex(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item: any) =>
      item[action.payload.keyName] ===
      action.payload.item[action.payload.keyName],
  );

  if (idx !== -1) {
    const newItems = [
      ...state.items.slice(0, idx),
      action.payload.item,
      ...state.items.slice(idx + 1),
    ];

    return {
      ...state,
      items: newItems,
    };
  }

  return state;
}

/**
 * 删除数据
 *
 * @template T
 * @param {State<T>} state
 * @param {Action} action
 * @returns
 */
function removeItem<T>(state: State<T>, action: Action) {
  const items = state.items.filter(
    (_item, index: number) => !action.payload.includes(index),
  );

  return {
    ...state,
    items,
  };
}

/**
 * 获取数据的reducer
 *
 * @param state 状态
 * @param action 动作
 */
function reducer<T>(state: State<T>, action: Action) {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isError: false,
        isLoading: true,
        searchParams: action.payload,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        items: action.payload
          ? [...state.items, ...action.payload.content]
          : [...state.items],
        pagenation: action.payload
          ? {
              ...state.pagenation,
              pageNo: action.payload.number,
              pageSize: action.payload.size,
              totalElements: action.payload.totalElements,
              sorts: action.payload.sorts,
            }
          : { ...state.pagenation },
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isError: true,
        isLoading: false,
      };
    case 'UPDATE_ITEM':
      return updateItem(state, action);
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    case 'REMOVE_ITEM':
      return removeItem(state, action);
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload,
      };
    default:
      return state;
  }
}

export default reducer;
