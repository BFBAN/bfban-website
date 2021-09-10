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
npm run serve // 主要前端启动

// 桌面应用启动
// 在启动electron服务器前，必须开启serve，因为electron的内置地址是serve本身
npm run electron 
```