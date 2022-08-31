# 执行

## 请求配置
在启动前端项目前，你需要前往`public/conf/requestConf.example.json`编辑配置;`requestActionName`字段对应下方`child`数组内配置。

```json
{
  "requestActionName": "development",
  "requestProductionName": "production",
  "child": {
    "development": {
      "protocol": "https",
      "request": "127.0.0.1:3000/api/"
    },
    "development1": {
      "protocol": "http",
      "request": "127.0.0.1:3000/api/",
      "qiniuUrl": ""
    }
  }
}
```

## 其他配置

网站类还有类似配置，它们作用于不同功能，在[public/conf/](public/conf/)能看到带`example`名称的文件，克隆并去掉`example`，放置本地目录。

具体说明请到[public/conf/](public/conf/)目录下查看README.md。

* 不带`example`的名称，基本上都是配置字典
* 任何问题可以在github上提交

## 启动服务

```
    1. 取得仓库
    2. 在/front目录下安装依赖
    npm i

    3. 启动服务
    npm run serve
```