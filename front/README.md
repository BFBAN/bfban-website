# frontend
lang：中文

## Project setup
更新frontend的依赖
```
npm install
```

### 启动
在frontend中包含好几部分的模块，通常启动请使用:
```
// 开发模式启动
npm run serve

// serve服务，需提前执行'npm i build'生成，启动本地服务来预览
npm run local-serve 

// 桌面应用启动
// 在启动electron服务器前，必须开启serve，因为electron的内置地址是serve本身
npm run electron 
```