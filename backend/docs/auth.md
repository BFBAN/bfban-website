# 授权

这将允许第三方绑定BFBAN账户到应用下

你首先需要向bfban申请一个特殊bot账户(在bfban网站找到社区，选择一个合适社区联系标有官方、开发者频道或成员)
，如果有你已经有符合的账户，可以继续往下看。

----

## 接入

当实现bfban某个功能时请求接口，来获取目标id身份，此接口会返回目标用户的token令牌，令牌过期时间，处决于`EXPIRES_IN`参数。

`POST` `/api/servers/externalAuth`

| 参数            | 类型               | 是否必选 | 描述                                      | 例子         | 版本 |
|---------------|------------------|------|-----------------------------------------|------------|----|
| id            | string or number | 必选   | BFBAN 用户id                              | 1          | 2  |
| IS_USERINFO   | bool             | 可选   | 是否返回目标信息，如果后期需要应该调用`/user/info?id={id}` |            |    |
| EXPIRES_IN    | number           | 可选   | 返回令牌过期时间戳                               | 1554209980 | 2  |
| CALLBACK_PATH | string           | 可选   | 如果有此地址，这依照地址回调参数，无需应答                   |            |    |
| CALLBACK_LP   | string           | 可选   | 一个临时申请令牌签名，用于验证你所发出去的请求验证               |            |    |

### HTTP头

- ***X-Access-Token***

  此接口需要`bot`身份, 读取token填写到headers下的`x-access-token`: {{you account token}}

### HTTP BODY: EXPIRES_IN

`bot`的身份令牌过期时间可以被定制，但它最长是一个月，到期令牌应当再次告知用户重新授权

### HTTP BODY: CALLBACK

如果特殊情况可以填写填写`CALLBACK_PATH`和`CALLBACK_LP`,来让bfban服务请求外部认证指定地址

* `CALLBACK_PATH`必须是`https`, 如果你地址没有，建议申请一个测试ssl来处理
* `CALLBACK_LP`需要生成一个请求随机串，我们推荐生成随机数算法如下：调用随机数函数生成，将得到的值转换为字符串。这里，我们使用命令行直接生成一个

```
POST:
  CALLBACK_PATH=https://bfban.com/api/auth
  CALLBACK_LP=593BEC0C930BF1AFEB40B4A08C8FB242
```


## 案例

    举报 > 选择举报账户 > 机器人自带或用户 > 选择用户 > (检查是否已有授权)绑定 > 调用授权 > 继续举报 ...

调用授权后，开发者对接口返回的数据处理，使用mysql或nosql、localdb之类来存储，需要处理好令牌时间管理，过时提示用户重新操作授权流程
