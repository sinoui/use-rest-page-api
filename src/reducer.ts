/* eslint-disable @typescript-eslint/no-explicit-any */
import { produce } from 'immer';
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
  pagination: PageInfo;
  searchParams?: { [x: string]: string };
  selectIds: string[];
  keyName: string;
}

export interface Reducer<T> {
  (state: State<T>, action: Action): State<T>;
}

/**
 * 设置部分字段
 *
 * @param draft 状态
 * @param action 动作
 */
const setItem = produce(<T>(draft: State<T>, action: Action) => {
  const { itemId, extraItemInfo, keyName } = action.payload;
  const index = draft.items.findIndex((item: any) => item[keyName] === itemId);
  if (index !== -1) {
    const newItem = { ...(draft.items as any)[index], ...extraItemInfo };
    (draft.items as any)[index] = newItem;
  }
});

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
 * 通过id删除数据项
 */
const removeItemById = produce(<T>(draft: State<T>, action: Action) => {
  const { itemIds, keyName } = action.payload;
  itemIds.forEach((itemId: string) => {
    const idx = draft.items.findIndex((item: any) => item[keyName] === itemId);
    if (idx !== -1) {
      draft.items.splice(idx, 1);
    }
  });
});

/**
 * 列表项选中事件
 */
const toggleSelectItem = produce(<T>(draft: State<T>, action: Action) => {
  const { id } = action.payload;
  const idx = draft.selectIds.findIndex((item) => item === id);
  if (idx !== -1) {
    draft.selectIds.splice(idx, 1);
  } else {
    draft.selectIds.push(id);
  }
});

/**
 * 全选事件
 */
const toggleSelectAll = produce(<T>(draft: State<T>) => {
  const { items, selectIds, keyName } = draft;
  const rowKeys = items.map((item: any) => item[keyName]);

  const flag = rowKeys.some((item) => !selectIds.includes(item));

  draft.selectIds = flag ? rowKeys : [];
});

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
        items: action.payload ? action.payload.content : [...state.items],
        // 每次查询之后重置之前的选中id集合
        selectIds: [],
        pagination: action.payload
          ? {
              ...state.pagination,
              pageNo: action.payload.number,
              pageSize: action.payload.size,
              totalElements: action.payload.totalElements,
              sorts: action.payload.sorts,
              totalPages: Math.ceil(
                action.payload.totalElements / action.payload.size,
              ),
            }
          : { ...state.pagination },
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
    case 'REMOVE_ITEM_BY_ID':
      return removeItemById(state, action);
    case 'REMOVE_ITEM':
      return removeItem(state, action);
    case 'SET_ITEM':
      return setItem(state, action);
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload,
      };
    case 'CLEAN_ITEMS':
      return {
        ...state,
        items: [],
        isLoading: false,
        isError: false,
        pagination: {
          ...state.pagination,
          pageNo: 0,
          totalElements: 0,
          sorts: [],
          totalPages: 0,
        },
      };
    case 'TOGGLE_SELECT_ITEM':
      return toggleSelectItem(state, action);

    case 'TOGGLE_SELECT_ALL':
      return toggleSelectAll(state);
    default:
      return state;
  }
}

export default reducer;
