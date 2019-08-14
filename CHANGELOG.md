# 版本变更说明

## v0.4.0

- fix:修复 useRestPageApi 的 crud 响应转换器类型声明错误
- breakchange: rawResponse 在有转换器的情况下返回值是直接获取来的数据而不是转换后的数据

## v0.3.0

- breakchange: setItem 方法不再返回更新之后的`item`
- improve: 缓存回调函数

## v0.2.1 - 2019.7.15

- fix: 修复 useRestPageApi 返回值`items`的类型为`any`的缺陷

## 0.2.0 - 2019.7.12

- feat: 添加删除数据响应转换器`transformRemoveResponse`
