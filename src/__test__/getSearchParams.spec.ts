import getSearchParams from '../getSearchParams';

it('get params', () => {
  const params = getSearchParams(3, 15, [
    { property: 'age', direction: 'desc' },
    { property: 'birthday', direction: 'asc' },
  ]);

  expect(params).toBe('page=3&size=15&sort=age%2Cdesc&sort=birthday');
});
