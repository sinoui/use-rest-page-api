# @sinoui/use-rest-page-api

@sinoui/use-rest-page-api 旨在简化分页列表和 RESTful CRUD API 交互的状态管理。

它可以帮助我们：

- 管理分页列表的查询
- 与 RESTful CRUD API 交互
- 列表数据维护
- 查询条件与浏览器的 url 同步

目录：

- [安装](#安装)
- [快速使用](#快速使用)
- [RESTful CRUD API](#restful-crud-api)
  - [获取分页数据](#获取分页数据)
  - [获取单个数据](#获取单个数据)
  - [新增数据](#新增数据)
  - [更新数据](#更新数据)
  - [删除数据](#删除数据)
- [数据结构](#数据结构)
  - [分页与排序信息](#分页与排序信息)
  - [分页查询响应](#分页查询响应)
- [useRestPageApi 参数说明](#userestpageapi-参数说明)
  - [url](#url)
  - [defaultValue](#defaultValue)
  - [options](#options)
- [转换器](#转换器)
  - [定制分页查询请求](#定制分页查询请求)
  - [定制分页查询响应转换器](#定制分页查询响应转换器)
  - [定制请求单个数据响应转换器](#定制请求单个数据响应转换器)
  - [定制新增请求的数据转换器](#定制新增请求的数据转换器)
  - [定制新增响应的数据转换器](#定制新增响应的数据转换器)
  - [定制更新请求的数据转换器](#定制更新请求的数据转换器)
  - [定制更新响应的数据转换器](#定制更新响应的数据转换器)
- [dataSurce 的属性和方法](#datasource-的属性和方法)
  - [获取查询数据](#获取查询数据)
  - [分页和排序](#分页和排序)
  - [列表查询](#列表查询)
  - [与增删改查 API 交互](#与增删改查-api-交互)

## 安装

```shell
yarn add @sinoui/use-rest-page-api
```

或者

```shell
npm i --save @sinoui/use-rest-page-api
```

## 快速使用

```tsx
import React from 'react';
import useRestPageAPi from '@sinoui/use-rest-page-api';

interface User {
  userId: string;
  userName: string;
}

function ListDemo() {
  const dataSource = useRestPageApi<User>('/apis/users');

  return (
    <div>
      {dataSource.isLoading && <div>正在加载人员列表数据...</div>}
      <h1>人员列表</h1>
      {dataSource.items.map((user) => (
        <div key={user.userId}>{user.userName}</div>
      ))}

      <button type="button" onClick={() => dataSource.fetch(1)}>
        加载第二页数据
      </button>
    </div>
  );
}
```

## RESTful CRUD API

以 Spring MVC 的分页格式为例说明 RESTful CRUD API。@sinoui/use-rest-page-api 默认集成了 Spring MVC 分页格式的解析器，同时支持扩展，自定义解析器，以支持其他类型的 API。

假定我们要维护一组人员数据，获取人员列表的 url 是`/users`。

### 获取分页数据

#### 请求

```
GET /users?sex=male&size=10&page=0&sort=firstName&sort=lastName,desc
```

请求参数说明：

- `sex=male` - 表示列表的过滤条件。@sinoui/use-rest-page-api 默认将过滤条件放在查询字符串中。
- `size`- 每一页的大小，默认为`10`，可以通过`options.pageSize`更改
- `page` - 第几页，从第 0 页开始计算
- `sort` - 排序，默认格式为`propertyName[,asc|desc]`，如果有多个，则按照`sort=propertyName&sort=propertyName2,desc`这样的方式编排

注意：这是@sinoui/use-rest-page-api 默认发送分页查询请求的格式，你的 RESTful API 如果不是这样的，那么你需要[定制分页查询请求](#定制分页查询请求)。

#### 响应

后端返回 json 格式数据，数据如下：

```js
{
  "content": [
    {
      "id": "1",
      "firstName": "张",
      "lastName": "三",
      "sex": "male"
    },
    {
      "id": "2",
      "firstName": "李",
      "lastName": "四",
      "sex": "male"
    }
    // 此处省去8条数据
  ],
  "totalElements": 540, // 符合条件的所有用户数量
  "size": 10, // 页大小，可以没有，默认与请求中的size一致
  "number": 0, // 当前第几页的意思，可以没有，默认与请求的page一致
  "totalPages": 54 // 一共多少页，可以没有，默认为`Math.ceil(totalElements / size)`
}
```

解释一下各属性的含义：

- `content` - 当前页查询到的数据
- `totalElements` - 符合查询条件的所有的数据数量
- `size` - 页大小。可以没有，默认与请求`size`参数一致
- `number` - 当前第几页。从 0 开始。可以没有，默认与请求`page`参数一致
- `totalPages` - 一共多少页。在限定大列表查询时比较有用，比如全文检索，查询到的数据数量与可以显示的数据数量可能会因为技术因素不能保持一致（拿百度、Google 查询实验一下就能理解），这时就可以额外指定一个不一样的`totalPages`，表示一共可以显示多少页的意思。可以没有，默认为`Math.ceil(totalElements / size)`

注意：如果你的 API 响应的数据格式不是这样的，那么你可以[定制分页查询响应转换器](#定制分页查询响应转换器)，将 API 响应数据转换成上面说的数据格式即可。

### 获取单个数据

有时为了展现详情数据，而列表返回的数据不是很全，这时你就需要通过 API 获取单个数据。

#### 请求

按照 RESTful 风格设计的 API，请求如下：

```
GET /users/1
```

#### 响应

返回 JSON 格式数据。

```json
{
  "id": "1",
  "firstName": "张",
  "lastName": "三",
  "sex": "male",
  "birthday": "1999-01-12"
}
```

注意：如果你的 API 响应数据格式不一致，你可以通过[定制请求单个数据响应转换器](#定制请求单个数据响应转换器)，来转换成这样的数据格式。

### 新增数据

#### 请求

```
POST /users
```

请求体是 JSON 格式的数据：

```json
{
  "firstName": "王",
  "lastName": "五",
  "sex": "female",
  "birthday": "2000-08-12"
}
```

注意：如果你的 API 请求数据格式不一致，你可以通过[定制新增请求的数据转换器](#定制新增请求的数据转换器)，将上面的数据格式转换成满足你的 API 的数据格式。

#### 响应

返回 JSON 格式的数据：

```json
{
  "id": "3",
  "firstName": "王",
  "lastName": "五",
  "sex": "female",
  "birthday": "2000-08-12"
}
```

注意：如果你的 API 响应数据格式不一致，你可以通过[定制新增响应的数据转换器](#定制新增响应的数据转换器)，将上面的数据格式转换成满足你的 API 的数据格式。

### 更新数据

#### 请求

```
PUT /users/3
```

请求体是 JSON 格式数据：

```json
{
  "id": "3",
  "firstName": "王",
  "lastName": "五",
  "sex": "male",
  "birthday": "2000-08-12"
}
```

注意：如果你的 API 请求数据格式不一致，你可以通过[定制更新请求的数据转换器](#定制更新请求的数据转换器)，将上面的数据格式转换成满足你的 API 的数据格式。

#### 响应

返回 JSON 格式的数据：

```json
{
  "id": "3",
  "firstName": "王",
  "lastName": "五",
  "sex": "male",
  "birthday": "2000-08-12"
}
```

注意：如果你的 API 响应数据格式不一致，你可以通过[定制更新响应的数据转换器](#定制更新响应的数据转换器)，将上面的数据格式转换成满足你的 API 的数据格式。

### 删除数据

#### 请求

删除单个数据：

```json
DELETE / users / 1
```

删除多条数据：

```
DELETE /users/1,2,3
```

注意：如果你的 API 不支持删除多条数据，那么请设置`options.useMultiDeleteApi`为`false`。

#### 响应

返回 200、201 等 2xx 状态码表示删除成功即可。

## 数据结构

### 分页与排序信息

排序：

```ts
interface SortInfo {
  direction: 'desc' | 'asc';
  property: string;
}
```

分页：

```ts
interface PageInfo {
  /**
   * 一共有多少条数据
   */
  totalElements: number;
  /**
   * 页大小，表示一页有多少条数据
   */
  pageSize: number;
  /**
   * 第几页，从0开始
   */
  pageNo: number;
  /**
   * 排序信息
   */
  sorts: SortInfo[];
}
```

### 分页查询响应

useRestPageApi 默认认为分页列表查询的数据结构如下：

```ts
interface PageResponse<T> {
  /**
   * 数据列表
   */
  content: T[];
  /**
   * 总大小
   */
  totalElements: number;
  /**
   * 一页显示多少条结果
   */
  size: number;
  /**
   * 当前是第几页
   */
  number: number;

  /**
   * 总页数，可以没有。如果没有，则等于`Math.ceil(totalElements/size)`。
   */
  totalPages?: number;
}
```

## useRestPageApi 参数说明

```ts
const dataSource = useRestPageApi<T, PageData>(
    url: string,
    defaultValue?: PageData<T>,
    options?: Options
);
```

### url

指定加载列表数据的`url`，一般为 RESTful CRUD API 中加载列表的`url`，也就是基础 url。加载列表数据的 url 与基础 url 不一致，可以通过`options.baseUrl`设定基础 url。

### defaultValue

指定默认的列表分页数据，默认为：

```js
{
  content: [];
}
```

### options

配置：

- `baseUrl` - 指定 curd api 的基础`url`，如果不指定，则默认为`url`。
- `defaultSearchParams` - 指定默认的查询条件。
- `defaultSort` - 指定默认的排序规则。
- `syncToUrl` - 如果为`true`，则会同步查询条件与浏览器 URL。默认为`false`。
- `keyName` - 指定唯一键属性名，默认为`id`。
- `useMultiDeleteApi` - 是否启动删除多条数据的 API。默认为`true`，表示启用。见[删除数据](#删除数据)章节。
- `transformListReponse` - 指定分页列表查询结果的转换器。
- `transformListRequest` - 指定分页查询条件转换器。
- `transformFetchOneRequest` - 指定获取单条数据的请求数据转换器。
- `transformFetchOneResponse` - 指定获取单条数据的响应数据转换器。
- `transformSaveRequest` - 指定新增数据的请求数据转换器。
- `transformSaveResponse` - 指定新增数据的响应数据转换器。
- `transformUpdateRequest` - 指定更新数据的请求数据转换器。
- `transformUpdateResponse` - 指定更新数据的响应数据转换器。

转换器可以用来定制你的 API 细节。会用一个章节来介绍。

## 转换器

如果你的 API 数据格式与@sinoui/use-rest-page-api 默认支持的不同，那么你可以使用转换器来实现定制，让@sinoui/use-rest-page-api 为你的 API 服务。

### 定制分页查询请求

使用`transformListRequest`来定制分页列表查询请求。例如下面的转换器：

```ts
import qs from 'qs';

export default function transformListRequest(
  searchParams: {
    [key: string]: string;
  },
  pageInfo: PageInfo,
) {
  return qs.stringify(
    {
      ...searchParams,
      pageSize: pageInfo.pageSize,
      pageNo: pageInfo.pageNo,
      sort: pageInfo.sorts.map(
        (sortInfo) =>
          `${sortInfo.property}${sortInfo.direction === 'desc' ? '_desc' : ''}`,
      ),
    },
    {
      arrayFormat: 'comma',
    },
  );
}
```

应用这个转换器后，发送的分页列表查询将会是下面的格式：

```
GET /users?sex=male&size=10&page=0&sort=firstName,lastName_desc
```

推荐使用[qs](https://github.com/ljharb/qs)来处理请求参数的序列化和解析。这里用到了[arrayFormat](https://github.com/ljharb/qs#stringifying)配置，设定为`comma`，那么遇到数组时，则会采用","的方式将多个数据连接在一起。arrayFormat 的几个参数如下所示：

```ts
qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'indices' });
// 'a[0]=b&a[1]=c'
qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'brackets' });
// 'a[]=b&a[]=c'
qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'repeat' });
// 'a=b&a=c'
qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'comma' });
// 'a=b,c'
```

> transformListRequest 方法结构如下：
>
> ```ts
> interface SearchParams {
>   [key: string]: any;
> }
>
> /**
>  * 转换列表查询的请求
>  *
>  * @param searchParams 查询条件
>  * @param pageInfo 分页信息
>  *
>  * @return {string} 返回列表查询请求的查询字符串。需要是字符串格式的。
>  */
> function transformListRequest(
>   searchParams: SearchParams,
>   pageInfo: PageInfo,
> ): string;
> ```

### 定制分页查询响应转换器

使用`transformListResponse`来转换分页列表查询响应的数据格式。如下所示的[Hacker News API](https://hn.algolia.com/api)转换器：

```ts
interface HackerNew {
  objectID: string;
  title: string;
  url: string;
  auth: string;
  tags: string[];
}

interface HackerNewsListResponse {
  hits: HackerNew[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
}

function transformListResponse(
  response: HackerNewsListResponse,
): PageResponse<HackerNew> {
  return {
    content: response.hits,
    totalElements: response.nbHits,
    number: response.page,
    totalPages: response.nbPages,
    size: response.hitsPerPage,
  };
}
```

> transformListResponse 函数的结构如下：
>
> ```ts
> function transformListPresponse<T, Response>(
>   response: Response,
> ): PageResponse<T>;
> ```

### 定制请求单个数据响应转换器

使用`transformFetchOneResponse`定制请求单个数据响应的数据格式。例如下面的示例：

```ts
interface User {
  userId: string;
  firstName: string;
  lastName: string;
}

interface Response {
  result: User;
  status: boolean;
}

function transformFetchOneResponse(response: Response): User {
  return response.result;
}
```

> transformFetchOneResponse 函数的结构如下：
>
> ```ts
> function transformFetchOneResponse<T, Response>(respone: Response): T;
> ```

### 定制新增请求的数据转换器

使用`transformSaveRequest`定制新增数据请求转换器。例如：

```ts
interface SaveUserInfo {
  user: User;
  time: long;
}

function transformSaveRequest(user: User): SaveUserInfo {
  return {
    user,
    time: new Date().getTime(),
  };
}
```

> transformSaveRequest 函数的数据结构如下：
>
> ```ts
> function transformSaveRequest<T, NewRequestData>(
>   data: T,
>   headers: { [key: string]: string },
> ): NewRequestData;
> ```

### 定制新增响应的数据转换器

使用`transformSaveResponse`定义新增响应的数据格式转变。例如：

```ts
interface Response {
  result: User;
  status: boolean;
  errorMessage?: string;
}

function transformSaveResponse(response: Response): User {
  if (response.status) {
    return response.result;
  }

  throw new Error('获取数据失败');
}
```

> transformSaveResponse 函数的数据结构如下：
>
> ```ts
> function transformSaveResponse<T, Response>(response: Response): T;
> ```

### 定制更新请求的数据转换器

使用`transformUpdateRequest`定制更新请求。用法与[transformSaveRequest](#定制新增请求的数据转换器)一致。

### 定制更新响应的数据转换器

使用`transformUpdateResponse`定制更新请求。用法与[transformSaveResponse](#定制新增响应的数据转换器)一致。

## dataSource 的属性和方法

```ts
const dataSource = useRestPageApi<User, ListRawResponse>('/users');
```

我们的组件可以通过`dataSource`与查询结果、查询条件、RESTful API 进行沟通。

### 获取查询数据

```ts
 // 获取当前页列表数据
const users: User[] = dataSource.items;

// 获取id为'1'的用户数据
const user: User = dataSource.getItemById('1');

// 更新id为'1'的用户数据
const newUser = {...user, 'sex': 'female'};
dataSource.updateItem(newUser);

// 更新部分字段
dataSource.setItem('1', 'sex', 'female');
dataSource.setItem('1', { birthday: '2000-10-12' });

// 新增
dataSource.addItem({id: '5', firstName: '赵'， lastName: '六'});

// 删除id为'1'的用户数据
dataSource.removeItemById('3');

// 删除多条数据
dataSource.removeItemsByIds(['1', '2', '3']);

// 获取原始响应数据
const rawResponse = dataSource.rawResponse;

// 获取是否正在加载列表数据的状态
const isLoading = dataSource.isLoading;

// 获取是否加载列表数据失败的状态
const isError = dataSource.isError;
```

注意：这里介绍的`getItemById`、`updateItem`、`setItem`、`addItem`、`removeItemById`这些方法只会与`dataSource.items`进行交互，不会与 RESTful CRUD API 进行交互。如果需要与 RESTful CRUD API 交互，参见[与增删改查 API 交互](#与增删改查-api-交互)。

### 分页和排序

```ts
// 获取分页信息
const pageInfo: PageInfo = dataSource.pagination;

// 获取下一页数据
dataSoure.nextPage();

// 获取上一页数据
dataSource.prevPage();

// 获取第10页数据
dataSource.fetch(9);

// 按照姓氏倒序排序
dataSource.sortWith('firstName', 'desc', 'lastName', 'asc');
// or
dataSource.sortWith([
  {
    property: 'firstName',
    sort: 'desc',
  },
  {
    property: 'lastName',
    sort: 'asc',
  },
]);
```

### 列表查询

```ts
// 根据查询条件获取数据
dataSource.query(searchParams);

// 获取查询条件
dataSource.searchParams;
// 获取默认的查询条件
dataSource.defaultSearchParams;
// 重置查询条件为默认查询条件，并发送列表查询请求
dataSource.reset();
// 更新默认的查询条件，并发送列表查询请求。
// 注意，这个方法会将新旧两个默认查询条件做对象合并后的新对象作为新的默认查询条件。
dataSource.setDefaultSearchParams({
  sex: 'female',
});
// 更新默认查询条件，但是不发送列表查询请求。
dataSource.setDefaultSearchParams({ sex: 'female' }, false);

// 获取第5页数据
dataSource.fetch(4);

// 重新获取当前页的数据
dataSource.refresh();
```

`fetch()`方法是查询列表的基础方法，它的语法格式如下：

```ts
function fetch<T>(
  pageNo?: number,
  pageSize?: number,
  sort?: SortInfo[],
  searchParams?: SearchParams,
): PageResponse<T>;
```

### 与增删改查 API 交互

```ts
// 获取id为'1'的数据
const user = await dataSource.get('1');

// 新增用户数据
const user = await dataSource.save({ firstName: '张', lastName: '三' });

// 修改用户数据
const user = await dataSource.update({
  id: '1',
  firstName: '张',
  lastName: '三',
});

// 删除数据
await dataSource.delete('1');
// or
await dataSource.remove('1');

// 删除多条数据
await dataSource.delete(['1', '2', '3']);
// or
await dataSource.remove(['1', '2', '3']);
```

以上操作默认均会修改`dataSource.items`。如果不需要更新，则可以指定函数的第二个参数为`false`，如：

```ts
const user = await dataSource.get('1', false);
```
