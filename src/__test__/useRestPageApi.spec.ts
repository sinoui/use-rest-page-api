import { renderHook } from 'react-hooks-testing-library';
import http from '@sinoui/http';
import useRestPageApi from '../useRestPageApi';

jest.mock('@sinoui/http');
it('只有url时获取数据成功', async () => {
  (http.get as jest.Mock).mockResolvedValue({
    content: [{ userId: '1', userName: '张三' }],
    number: 0,
    size: 1,
    totalElements: 1,
  });

  const { result, waitForNextUpdate } = renderHook(() =>
    useRestPageApi('/test'),
  );

  expect(result.current.items).toEqual([]);
  expect(result.current.isError).toBeFalsy();
  expect(result.current.isLoading).toBeTruthy();
  expect(result.current.pagenation).toEqual({
    pageNo: 0,
    pageSize: 15,
    totalElements: 0,
  });

  await waitForNextUpdate();

  expect(result.current.isLoading).toBeFalsy();
  expect(result.current.items[0]).toEqual({ userId: '1', userName: '张三' });
  expect(result.current.pagenation.totalElements).toBe(1);
});

it('只有url参数时获取数据失败', async () => {
  (http.get as jest.Mock).mockRejectedValue(new Error('Async error'));

  const { result, waitForNextUpdate } = renderHook(() =>
    useRestPageApi('/test'),
  );

  expect(result.current.isError).toBeFalsy();

  await waitForNextUpdate();

  expect(result.current.isError).toBeTruthy();
});

it('添加排序字段', async () => {
  (http.get as jest.Mock).mockResolvedValue({
    content: [
      { userId: '1', userName: '张三', age: 27 },
      { userId: '2', userName: '李四', age: 20 },
    ],
    number: 0,
    size: 10,
    totalElements: 2,
  });

  const { result, waitForNextUpdate } = renderHook(() =>
    useRestPageApi('/test?sex=man', undefined, {
      sorts: [
        { property: 'age', direction: 'desc' },
        { property: 'userId', direction: 'asc' },
      ],
    }),
  );

  expect(result.current.items.length).toBe(0);

  await waitForNextUpdate();

  expect(result.current.items.length).toBe(2);
});

it('自定义每页条数', async () => {
  (http.get as jest.Mock).mockResolvedValue({
    content: [
      { userId: '1', userName: '张三', age: 27 },
      { userId: '2', userName: '李四', age: 20 },
    ],
    number: 0,
    size: 10,
    totalElements: 2,
  });

  const { result } = renderHook(() =>
    useRestPageApi('/test?sex=man', undefined, {
      pageSize: 50,
    }),
  );

  expect(result.current.pagenation.pageSize).toBe(50);
});
