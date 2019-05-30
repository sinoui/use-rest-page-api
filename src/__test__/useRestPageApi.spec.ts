import { renderHook } from 'react-hooks-testing-library';
import http from '@sinoui/http';
import useRestPageApi from '../useRestPageApi';

jest.mock('@sinoui/http');

afterEach(() => {
  (http.get as jest.Mock).mockReset();
  (http.post as jest.Mock).mockReset();
  (http.put as jest.Mock).mockReset();
  (http.delete as jest.Mock).mockReset();
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

describe('不与后端交互的操作', () => {
  async function init() {
    (http.get as jest.Mock).mockResolvedValue({
      content: [{ userId: '1', userName: '张三' }],
      number: 0,
      size: 1,
      totalElements: 1,
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useRestPageApi('/test', undefined, { keyName: 'userId' }),
    );

    await waitForNextUpdate();

    return result;
  }

  it('获取指定id的数据', async () => {
    const result = await init();
    const item = result.current.getItemById('1');

    expect(item).toEqual({ userId: '1', userName: '张三' });
  });

  it('更新item', async () => {
    const result = await init();

    const newUser = { userId: '1', userName: '张三', age: 26 };
    result.current.updateItem(newUser);

    expect(result.current.items).toEqual([{ ...newUser }]);
  });

  it('部分字段更新', async () => {
    const result = await init();

    const newUser = result.current.setItem('1', {
      age: 26,
      birthday: '1993-08-16',
    });

    expect(newUser).toEqual({
      userId: '1',
      userName: '张三',
      age: 26,
      birthday: '1993-08-16',
    });
    expect(result.current.items).toEqual([
      {
        userId: '1',
        userName: '张三',
        age: 26,
        birthday: '1993-08-16',
      },
    ]);

    result.current.setItem('1', { birthday: '1993-10-16' });

    expect(result.current.items[0].birthday).toBe('1993-10-16');
  });

  it('一组数据字段更新', async () => {
    const result = await init();
    result.current.addItem({ userId: '2', userName: '李四' });
    result.current.addItem({ userId: '3', userName: '王五' });

    result.current.setItems([
      { userId: '2', userName: '赵六' },
      { userId: '3', age: 26 },
    ]);

    expect(result.current.items).toEqual([
      { userId: '2', userName: '赵六' },
      { userId: '3', age: 26 },
    ]);
  });

  it('新增数据', async () => {
    const result = await init();

    expect(result.current.items).toEqual([{ userId: '1', userName: '张三' }]);

    result.current.addItem({ userId: '2', userName: '李四' });
    expect(result.current.items).toEqual([
      { userId: '1', userName: '张三' },
      { userId: '2', userName: '李四' },
    ]);
  });

  it('删除一条数据', async () => {
    const result = await init();

    expect(result.current.items).toEqual([{ userId: '1', userName: '张三' }]);

    result.current.removeItemById('1');

    expect(result.current.items.length).toBe(0);

    result.current.removeItemById('1');

    expect(result.current.items.length).toBe(0);
  });

  it('删除指定行的数据', async () => {
    const result = await init();

    expect(result.current.items.length).toBe(1);

    result.current.addItem({ userId: '2', userName: '李四' });
    result.current.addItem({ userId: '3', userName: '王五' });
    expect(result.current.items.length).toBe(3);

    result.current.removeItemAt(2);
    expect(result.current.items.length).toBe(2);
    expect(result.current.items).toEqual([
      { userId: '1', userName: '张三' },
      { userId: '2', userName: '李四' },
    ]);

    result.current.removeItemAt(2);

    expect(result.current.items).toEqual([
      { userId: '1', userName: '张三' },
      { userId: '2', userName: '李四' },
    ]);

    result.current.addItem({ userName: '王五' });

    expect(result.current.items.length).toBe(3);

    result.current.removeItemAt(2);
  });

  it('删除多条数据', async () => {
    const result = await init();

    expect(result.current.items.length).toBe(1);

    result.current.addItem({ userId: '2', userName: '李四' });
    result.current.addItem({ userId: '3', userName: '王五' });
    result.current.addItem({ userId: '4', userName: '赵六' });

    expect(result.current.items.length).toBe(4);
    result.current.removeItemsByIds(['2', '4']);

    expect(result.current.items.length).toBe(2);
  });
});

it('获取数据详情', async () => {
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
      userId: '1',
      userName: '张三',
      age: '27',
      sex: '男',
      fav: '足球、篮球、乒乓球',
    })
    .mockResolvedValueOnce({
      userId: '1',
      userName: '张三',
      age: '27',
      sex: '男',
      fav: '足球、篮球、乒乓球',
      adress: '上海',
    })
    .mockRejectedValueOnce(new Error('async error'));

  const { result, waitForNextUpdate } = renderHook(() =>
    useRestPageApi('/test', undefined, { keyName: 'userId' }),
  );

  await waitForNextUpdate();

  expect(result.current.items[1]).toEqual({
    userId: '1',
    userName: '张三',
    age: 27,
  });

  const data = await result.current.get('1', false);

  expect(data).toEqual({
    userId: '1',
    userName: '张三',
    age: '27',
    sex: '男',
    fav: '足球、篮球、乒乓球',
  });
  expect(result.current.items[1]).toEqual({
    userId: '1',
    userName: '张三',
    age: 27,
  });

  const userInfo = await result.current.get('1');

  expect(userInfo).toEqual({
    userId: '1',
    userName: '张三',
    age: '27',
    sex: '男',
    fav: '足球、篮球、乒乓球',
    adress: '上海',
  });

  expect(result.current.items[1]).toEqual({
    userId: '1',
    userName: '张三',
    age: '27',
    sex: '男',
    fav: '足球、篮球、乒乓球',
    adress: '上海',
  });

  result.current.get('1');
});

it('新增数据', async () => {
  (http.get as jest.Mock).mockResolvedValue({
    content: [
      { userId: '2', userName: '李四', age: 20 },
      { userId: '1', userName: '张三', age: 27 },
    ],
    number: 0,
    size: 10,
    totalElements: 2,
  });
  (http.post as jest.Mock)
    .mockResolvedValueOnce({
      userId: '3',
      userName: '王五',
      age: 20,
    })
    .mockResolvedValueOnce({
      userId: '4',
      userName: '赵六',
      age: 22,
      birthday: '1997-09-25',
      fav: '足球、篮球、乒乓球',
      adress: '上海',
    })
    .mockRejectedValueOnce(new Error('async error'));

  const { result, waitForNextUpdate } = renderHook(() =>
    useRestPageApi('/test', undefined, { keyName: 'userId' }),
  );

  await waitForNextUpdate();

  expect(result.current.items.length).toBe(2);

  const newUser1 = await result.current.save(
    { userId: '3', userName: '王五' },
    false,
  );

  expect(newUser1).toEqual({ userId: '3', userName: '王五', age: 20 });
  expect(result.current.items.length).toBe(2);

  const newUser2 = await result.current.save({
    userId: '4',
    userName: '赵六',
    age: 22,
    birthday: '1997-09-25',
  });

  expect(newUser2).toEqual({
    userId: '4',
    userName: '赵六',
    age: 22,
    birthday: '1997-09-25',
    fav: '足球、篮球、乒乓球',
    adress: '上海',
  });
  expect(result.current.items.length).toBe(3);

  result.current.save({});
});

it('更新数据详情', async () => {
  (http.get as jest.Mock).mockResolvedValue({
    content: [
      { userId: '2', userName: '李四', age: 20 },
      { userId: '1', userName: '张三', age: 27 },
    ],
    number: 0,
    size: 10,
    totalElements: 2,
  });

  (http.put as jest.Mock)
    .mockResolvedValueOnce({
      userId: '1',
      userName: '张三',
      age: '27',
      sex: '男',
      fav: '足球、篮球、乒乓球',
    })
    .mockResolvedValueOnce({
      userId: '1',
      userName: '张三',
      age: '27',
      sex: '男',
      fav: '足球、篮球、乒乓球',
      adress: '上海',
    })
    .mockRejectedValueOnce(new Error('async error'));

  const { result, waitForNextUpdate } = renderHook(() =>
    useRestPageApi('/test', undefined, { keyName: 'userId' }),
  );

  await waitForNextUpdate();

  expect(result.current.items[1]).toEqual({
    userId: '1',
    userName: '张三',
    age: 27,
  });

  const data = await result.current.update(
    {
      userId: '1',
      userName: '张三',
      age: '27',
      sex: '男',
      fav: '足球、篮球、乒乓球',
    },
    false,
  );

  expect(data).toEqual({
    userId: '1',
    userName: '张三',
    age: '27',
    sex: '男',
    fav: '足球、篮球、乒乓球',
  });
  expect(result.current.items[1]).toEqual({
    userId: '1',
    userName: '张三',
    age: 27,
  });

  const userInfo = await result.current.update({
    userId: '1',
    userName: '张三',
    age: '27',
    sex: '男',
    fav: '足球、篮球、乒乓球',
    adress: '上海',
  });

  expect(userInfo).toEqual({
    userId: '1',
    userName: '张三',
    age: '27',
    sex: '男',
    fav: '足球、篮球、乒乓球',
    adress: '上海',
  });

  expect(result.current.items[1]).toEqual({
    userId: '1',
    userName: '张三',
    age: '27',
    sex: '男',
    fav: '足球、篮球、乒乓球',
    adress: '上海',
  });

  result.current.update({ userId: '1', adress: '北京' });
});

it('删除数据，与crud交互', async () => {
  (http.get as jest.Mock).mockResolvedValue({
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
    totalElements: 2,
  });

  (http.delete as jest.Mock)
    .mockResolvedValueOnce('删除成功')
    .mockResolvedValueOnce('删除成功')
    .mockResolvedValueOnce('删除成功')
    .mockResolvedValueOnce('删除成功')
    .mockRejectedValueOnce(new Error('失败'));

  const { result, waitForNextUpdate } = renderHook(() =>
    useRestPageApi('/test', undefined, { keyName: 'userId' }),
  );

  await waitForNextUpdate();

  expect(result.current.items.length).toBe(10);

  await result.current.remove('1', false);

  expect(result.current.items.length).toBe(10);

  await result.current.remove('2');

  expect(result.current.items.length).toBe(9);

  await result.current.remove(['3', '4'], false);

  expect(result.current.items.length).toBe(9);

  await result.current.remove(['5', '6']);

  expect(result.current.items.length).toBe(7);

  result.current.remove('7');
});

it('配置不允许删除多项', async () => {
  (http.get as jest.Mock).mockResolvedValue({
    content: [
      { userId: '2', userName: '李四', age: 20 },
      { userId: '1', userName: '张三', age: 27 },
    ],
    number: 0,
    size: 10,
    totalElements: 2,
  });

  const { result, waitForNextUpdate } = renderHook(() =>
    useRestPageApi('/test', undefined, {
      keyName: 'userId',
      useMultiDeleteApi: false,
    }),
  );

  await waitForNextUpdate();

  expect(result.current.items.length).toBe(2);

  await result.current.remove(['1', '2'], false);

  expect(result.current.items.length).toBe(2);
  expect(http.delete).toHaveBeenCalledTimes(0);
});
