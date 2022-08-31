# 怎么使用 BFBAN v2.0 的 msGraphAPI

1. 初始化

   Request:

   ```http
   GET /api/admin/msGraphInit HTTP/1.1
   ```

   Response:

   ```http
   HTTP/1.1 200 OK
   Content-Type: application/json
   
   {
     "success": 1,
     "code": "msGraphInit.redirect",
     "data": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=xxxxx"	// something like that
   }
   ```

2. 访问返回内容 data 字段网址，登录微软账号，会自动导向 httpbin.org ，记录下其中的 code 参数
   Response:

   ```javascript
   {
     "args": {
       "client_info": "eyJxxxxx", 
       "code": "0.xxxxx", 
       "session_state": "xxx-xxx-xxx-xx"	// something like that
     }, 
     ...
   }
   ```

3. 将 code 参数按如下格式 POST 回本地服务器
   ```http
   POST /api/admin/msGraphAuthCode HTTP/1.1
   Content-Type: application/json
   
   {
       "data": {
           "code": "0.xxxxxxx"	// something like that
       }
   }
   ```

4. 返回 `success: 1` 和 userId accessToken 即成功

5. 现在就可使用任意正常账号进行文件上传

- 4MB 以下文件 PUT /api/service/upload

  ```http
  PUT /api/service/upload HTTP/1.1
  Content-Type: 文件的MIME格式
  Content-Length: 文件大小，必须严格相等
  
  [文件内容]
  ```

- 4MB以上文件

  Request: 

  ```http
  POST /api/service/uploadBigFile HTTP/1.1
  Content-Type: application/json
  
  {
      "data": {
          "size": 文件大小，必须严格相等,
          "mimeType": 文件的MIME格式
      }
  }
  ```

  Response:

  ```http
  HTTP/1.1 201 Created
  {
    "success": 1,
    "code": "upload.success",
    "data": {
      "name": "{time}_{random_uuid}.mp4",
      "size": 0,
      "uploadUrl": "A very long url",
      "expiredAt": "2022-08-27T12:20:14.291Z"
    }
  }
  ```

  然后可以复制该 uploadUrl 至 test 文件夹下的 uploadFile.html 内粘贴选择对应文件上传

