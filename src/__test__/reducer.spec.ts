import reducer from '../reducer';

const defaultState = {
  items: [],
  isError: false,
  isLoading: false,
  pagenation: {
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
