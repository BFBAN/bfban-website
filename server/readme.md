python -m SimpleHTTPServer 8000

or

yarn global add http-server  (https://www.npmjs.com/package/http-server)

### install dependences

yarn install --modules-folder /Users/mygoare/Dropbox/node/node_modules 




优酷直接播放器播放(无广告)
http://player.youku.com/embed/XMzQ2MzAwMzgwOA==



获取jwt token
/auth

上传文件 file
/upload

抓取 上传视频列表
/youku/:youku_username

抓取 teamliquid tournament
/teamliquid/:teamliquid_tournament_url


更加安全 (csrf-token 结合 jwt token)  可以随cookie一起被提交 进行验证
head csrf token

ajax 带cookie提交
xhrFields: {
            withCredentials: true
        },
同时 服务器端 Access-Control-Allow-Credentials = true

mongoose 连接成功后，再启动 express app



quill editor get html content
https://github.com/quilljs/quill/issues/903
quill.root.innerHTML or document.querySelector(".ql-editor").innerHTML


// pm2.config.js
pm2 start pm2.config.js
