# 授权

这将允许第三方绑定BFBAN账户到应用下

你首先需要向bfban申请一个特殊bot账户(在bfban网站找到社区，选择一个合适社区联系标有官方、开发者频道或成员)
，如果有你已经有符合的账户，可以继续往下看。

----

## 接入

## 1.创建

创建callback回调POST接口,比如`POST` `https://you.com/auth` ，用于处理接收BFBAN的确认，它会返回`userID`和`token`
，对应用户id和用户令牌

```json
{
  "userId": 1,
  "token": "......"
}
```

## 2.申请绑定/授权

向BFBAN站内用户申请应用授权，将向站内用户发送确认邮件。

`POST` `/api/servers/externalAuth`

| 参数                  | 类型               | 是否必选 | 描述                                                   | 例子         | 版本 |
|---------------------|------------------|------|------------------------------------------------------|------------|----|
| **id**              | string or number | 必选   | BFBAN 用户id                                           | 1          | 2  |
| appId               | any              | 可选   | 联系BFBAN社区申请                                          |            |    |
| appName             | string           | 可选   | 此名称会在邮件呈现，如果不填则或使用你当前令牌的身份                           |            |    |
| EXPIRES_IN          | number           | 可选   | 授权的站内用户令牌过期时间戳                                       | 1554209980 | 2  |
| ***CALLBACK_PATH*** | string           | 必选   | 在用户确认后，所填的地址会收到来自BFBAN的post请求，它包含用户令牌和id(必须是https地址) |            |    |

### HTTP头

- ***X-Access-Token***

  需要`bot`身份, 读取token填写到headers下的`x-access-token`: {{you account token}}

### HTTP BODY: EXPIRES_IN

`bot`的身份令牌过期时间可以被定制，但它最长是一个月，到期令牌应当再次告知用户重新续期

### HTTP BODY: CALLBACK_PATH

填写`CALLBACK_PATH`,来让bfban服务请求外部授权确认地址，告知bfban站内用户已确认授权

* `CALLBACK_PATH`必须是`https`, 如果你地址没有，建议申请一个测试ssl来处理

```
POST:
  CALLBACK_PATH=https://you.com/auth
```

## 案例

    举报 > 选择举报账户 > 机器人自带或用户 > 选择用户 > (检查是否已有授权)绑定 > 调用授权 > 继续举报 ...

调用授权后bfban会向授权用户邮箱发送一封确认邮件，在确认期间开发者需要轮查状态，使用mysql或nosql、localdb之类来存储，需要处理好令牌时间管理，过时提示用户重新操作授权流程
