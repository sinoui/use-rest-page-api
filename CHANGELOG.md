# 版本变更说明

## v1.1.0 - 2022.05.05

- feat: 支持异步 transformListReponse

## v1.0.4 - 2022.04.28

- fix: 修复默认查询条件为异步获取时，初始化获取数据时，默认查询条件不更新的 bug

## v1.0.3 - 2022.04.25

- feat: url 为空时，不发送请求

## v1.0.2 - 2022.03.09

- feat: 添加列表选中 id 集合数据，添加列表单条数据选中和全选的方法

## v1.0.1 - 2021.11.23

- fix: 修复 `sortWith()` 发送的请求丢失请求参数的缺陷

## v1.0.0 - 2019.9.19

- feat: 升级 @sinoui/http@1.0.0

## v0.4.0 - 2019.8.14

- fix:修复 useRestPageApi 的 crud 响应转换器类型声明错误 #5
- breakchange: rawResponse 在有转换器的情况下返回值是直接获取来的数据而不是转换后的数据 #6
- improve: 添加`setDefaultSearchParams`方法更新默认查询条件 #4

## v0.3.0

- breakchange: setItem 方法不再返回更新之后的`item`
- improve: 缓存回调函数

## v0.2.1 - 2019.7.15

- fix: 修复 useRestPageApi 返回值`items`的类型为`any`的缺陷

## 0.2.0 - 2019.7.12

- feat: 添加删除数据响应转换器`transformRemoveResponse`
