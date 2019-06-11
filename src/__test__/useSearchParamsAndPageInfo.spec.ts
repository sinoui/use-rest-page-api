import { getSearchParamsAndPageInfo } from '../useSearchParamsAndPageInfo';

it('getSearchParamsAndPageInfo', () => {
  window.history.pushState('', '', '?age=10');
  const defaultSearchParams = {
    a: 1,
  };
  const defaultPageInfo: any = {
    pageNo: 1,
    pageSize: 16,
    sorts: [
      {
        direction: 'asc',
        property: 'age',
      },
    ],
  };
  const [searchParams, pageInfo] = getSearchParamsAndPageInfo(
    defaultSearchParams,
    defaultPageInfo,
    true,
  );

  expect(searchParams).toEqual({
    age: '10',
  });
  expect(pageInfo).toEqual(defaultPageInfo);
});
