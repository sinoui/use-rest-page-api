import { renderHook } from 'react-hooks-testing-library';
import http from '@sinoui/http';
import useRestPageApi from '../useRestPageApi';

jest.mock('@sinoui/http');

afterEach(() => {
  (http.get as jest.Mock).mockReset();
});

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

it('fetch方法获取数据', async () => {
  (http.get as jest.Mock)
    .mockResolvedValueOnce({
      content: [
        { userId: '1', userName: '张三', age: 27 },
        { userId: '2', userName: '李四', age: 20 },
      ],
      number: 0,
      size: 10,
      totalElements: 2,
    })
    .mockResolvedValueOnce({
      content: [
        { userId: '1', userName: '张三', age: 27 },
        { userId: '2', userName: '李四', age: 20 },
        { userId: '3', userName: '王五', age: 20 },
      ],
      number: 1,
      size: 10,
      totalElements: 13,
    })
    .mockResolvedValueOnce({
      content: [
        { userId: '1', userName: '张三', age: 27 },
        { userId: '2', userName: '李四', age: 20 },
        { userId: '3', userName: '王五', age: 20 },
      ],
      number: 1,
      size: 15,
      totalElements: 18,
    });
  const { result } = renderHook(() => useRestPageApi('/test'));

  expect(result.current.pagenation.pageNo).toBe(0);

  await result.current.fetch(1);

  expect(result.current.pagenation.pageNo).toBe(1);

  await result.current.fetch(undefined, 15);

  expect(result.current.pagenation.pageSize).toBe(15);
  expect(http.get).toHaveBeenCalledTimes(3);
});

it('获取下一页数据', async () => {
  (http.get as jest.Mock)
    .mockResolvedValueOnce({
      content: [
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
      number: 0,
      size: 10,
      totalElements: 17,
    })
    .mockResolvedValueOnce({
      content: [
        { userId: '11', userName: '李四', age: 20 },
        { userId: '12', userName: '李四', age: 20 },
        { userId: '13', userName: '李四', age: 20 },
        { userId: '14', userName: '李四', age: 20 },
        { userId: '15', userName: '李四', age: 20 },
        { userId: '16', userName: '李四', age: 20 },
        { userId: '17', userName: '李四', age: 20 },
      ],
      number: 1,
      size: 10,
      totalElements: 17,
    });

  const { result, waitForNextUpdate } = renderHook(() =>
    useRestPageApi('/test'),
  );

  expect(result.current.pagenation.pageNo).toBe(0);

  await waitForNextUpdate();

  expect(result.current.pagenation.pageNo).toBe(0);

  await result.current.nextPage();

  expect(result.current.pagenation.pageNo).toBe(1);
});

it('获取上一页数据', async () => {
  (http.get as jest.Mock)
    .mockResolvedValueOnce({
      content: [
        { userId: '11', userName: '李四', age: 20 },
        { userId: '12', userName: '李四', age: 20 },
        { userId: '13', userName: '李四', age: 20 },
        { userId: '14', userName: '李四', age: 20 },
        { userId: '15', userName: '李四', age: 20 },
        { userId: '16', userName: '李四', age: 20 },
        { userId: '17', userName: '李四', age: 20 },
      ],
      totalElements: 17,
      number: 1,
      size: 10,
    })
    .mockResolvedValueOnce({
      content: [
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
      number: 0,
      size: 10,
      totalElements: 17,
    });

  const { result, waitForNextUpdate } = renderHook(() =>
    useRestPageApi('/test'),
  );

  expect(result.current.pagenation.pageNo).toBe(0);

  await waitForNextUpdate();

  expect(result.current.pagenation.pageNo).toBe(1);
  expect(http.get).toHaveBeenCalledTimes(1);

  await result.current.prevPage();

  expect(result.current.pagenation.pageNo).toBe(0);
  expect(http.get).toHaveBeenCalledTimes(2);
});

it('列表排序', async () => {
  (http.get as jest.Mock)
    .mockResolvedValueOnce({
      content: [
        { userId: '2', userName: '李四', age: 20 },
        { userId: '1', userName: '张三', age: 27 },
      ],
      number: 0,
      size: 10,
      totalElements: 2,
    })
    .mockResolvedValueOnce({
      content: [
        { userId: '1', userName: '张三', age: 27 },
        { userId: '2', userName: '李四', age: 20 },
      ],
      number: 0,
      size: 10,
      totalElements: 2,
    });

  const { result, waitForNextUpdate } = renderHook(() =>
    useRestPageApi('/test'),
  );

  expect(result.current.pagenation.sorts).toBeUndefined();

  await waitForNextUpdate();

  await result.current.sortWith([
    { property: 'age', direction: 'desc' },
    { property: 'userId', direction: 'asc' },
  ]);

  expect(result.current.pagenation.sorts).toEqual([
    { property: 'age', direction: 'desc' },
    { property: 'userId', direction: 'asc' },
  ]);
  expect(http.get).toBeCalledTimes(2);
});
