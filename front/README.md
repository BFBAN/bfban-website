# BFBAN 前端模块

该目录存放网站用户端模块，基于vue2 + vue-cli实现。

1. [网站配置](./public/conf) 网站全局(移动应用同步此配置)的配置，包含主题、判决类型等等
2. [桌面开发](./desktop) 网站附属产品，桌面应用
3. [主题文件](./public/theme) 主题配置文件，需同时配置`publuc/config/theme.json`

----

## 参与开发

* 网站开发, 对应在[这里](/front),在开始前您可以阅读[运行前端](docs/run_front.md)
  * 对于翻译，您应该在/front运行`npm run lint:development-i18n`校验文本格式
  * 请应用本项目.eslintrc约束
* 桌面混合开发, 对应在[这里](https://github.com/BFBAN/bfban-desktop) (桌面模式已经从此项目中剥离出去)
* 后端开发, 对应在[这里](/backend),请阅读[文件夹](/backend/docs/)内.md;
  * 提供一个注释生成，在执行`npm run start`后访问127.0.0.1:3000/docs接口文档
  * (重要) 后端包含几个独立服务，它们负责图床、EA服务，这些都需要在/backend/config.js完成配置后独立执行`npm run services`
