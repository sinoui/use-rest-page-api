import reducer from '../reducer';

const defaultState = {
  items: [],
  isError: false,
  isLoading: false,
  pagination: {
    totalElements: 0,
    pageSize: 15,
    pageNo: 0,
  },
};

it('type为FETCH_SUCCESS时,paload为空，此时items和pagenation保持不变', () => {
  const state = reducer(defaultState, { type: 'FETCH_INIT' });

  expect(state.isLoading).toBeTruthy();

  const newState = reducer(state, { type: 'FETCH_SUCCESS' });

  expect(newState.isLoading).toBeFalsy();
  expect(newState.items).toEqual(state.items);

  const thirdState = reducer(newState, { type: '' });

  expect(thirdState).toEqual(newState);
});

it('如果要更新的item不存在，则状态不变', () => {
  const state = reducer(defaultState, {
    type: 'UPDATE_ITEM',
    payload: { item: { userId: '1', age: 26 }, keyName: 'userId' },
  });

  expect(state).toEqual(defaultState);
});

it('删除数据', () => {
  const state = {
    items: [
      { userId: '1', userName: '张三', age: 27 },
      { userId: '2', userName: '李四', age: 20 },
      { userId: '3', userName: '李四', age: 20 },
      { userId: '4', userName: '李四', age: 20 },
      { userId: '5', userName: '李四', age: 20 },
      { userId: '6', userName: '李四', age: 20 },
      { userId: '7', userName: '李四', age: 20 },
      { userId: '8', userName: '李四', age: 20 },
      { userId: '9', userName: '李四', age: 20 },
      { userId: '10', userName: '李四', age: 20 },
    ],
    isError: false,
    isLoading: false,
    pagination: {
      totalElements: 0,
      pageSize: 15,
      pageNo: 0,
    },
  };

  const newState = reducer(state, {
    type: 'REMOVE_ITEM',
    payload: [0],
  });

  expect(newState.items.length).toBe(9);

  const thirdState = reducer(newState, {
    type: 'REMOVE_ITEM',
    payload: [3, 5, 7],
  });

  expect(thirdState.items.length).toBe(6);
});
