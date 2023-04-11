# Transifex翻译流程 (ZH)

很感谢对于网站翻译有兴趣，在参与翻译贡献之前，请务必阅读一些需要知道的条件

* 阅读此文章可能第一次接触翻译工作用户，如果你清楚可以跳过一些流程
* 此文章尽可能的使用可视化操作
----

## 准备

### 准备一个Transifex账户
前往[transifex.com](transifex.com)上注册，您也可以使用第三方直接登录(如GitHub,Google等)

### 加入项目

[BFBAN WebSite项目](https://app.transifex.com/bfban/bfban-website)

[BFBAN App项目](https://explore.transifex.com/bfban/bfban-app-mobile/)

点击上方链接后, 选择加入该项目, 填写你的[主译语言](), 然后选择继续, 等待[BFBAN开发组]同意您的翻译请求. (同意后会发送邮件至您账号的邮箱)

 - 注意 : 如果您想成为BFBAN系列项目的翻译专员, 请联系BFBAN开发组, 开发组成员将会授予您翻译专员权限, 您可以翻译更多语言以及新增语言. (未申请翻译专员, 只能翻译您每个项目的主译语言)
              
 - 主译语言 : 指您的第一翻译语言, 即您最擅长的语言.


## 翻译

### 1.现有翻译

如果你是第一次参与翻译工作，请不要忘记[签署名称]

进入Transifex的信息面板, 选择你要翻译的语言, 点击翻译进入[编辑器](https://app.transifex.com/bfban/editor/).
              
我们可以看到全部字段, 待翻译字段以及待复核字段.
              
点击您要翻译的字段, 在中间的翻译区填写对应翻译的内容, 然后点击保存翻译按钮(或使用Alt+Enter按键保存).
              
翻译的内容可进行校正修改, 直接对需要修改翻译内容的字段进行编辑即可.

### 2.启动新的翻译

您必须为BFBAN翻译专员才可进行新语言的添加!

如果您是BFBAN翻译专员, 您可以到项目的信息面板中, 选择申请新的语言, 填写对应语言并点击申请, [BFBAN开发组]将会收到您的请求并会尽快处理.
              
新增的语言，请不要忘记在GitHub仓库中的`languages.json`中新增新的语言, 来[签署名称], 你可以参考`zh`字段结构.

## 规则

- (重要)翻译基础由zh_CN拓展.
- 新申请的语言建议为常用国际语言,不建议申请小众语种.

### SEO 翻译规则

seo指搜索引擎的算法, 为引擎添加关键词; 通常在某个字段下包含`seo`都表示着这个字段是一个单独页面.

- SEO必须由`description`和`keywords`组成
  - `description` 描述，请按照zh.json对本地描述
  - `keywords`字段的值，存在多个应当用','来分割

## 签署

```json
{
  "name": "zh-CN", // Local id
  "label": "简体中文", // Show Lang Name
  "main": false,
  "members": [
    // 在这里添加
    {
      "name": "You name",
      "url": "Your online address, can be github, website, display page"
    }
  ]
}
```

## 提交

在您100%完成一种语言的翻译后, 等待[BFBAN开发组]或[翻译专员](https://app.transifex.com/bfban/teams/)进行复核. 当所有字段复核完毕后, Transifex将会自动将翻译的内容同步到GitHub的仓库中. 对应新的语言翻译需要对程序维护, 因此无法立即同步到BFBAN WebSite中.

----

[BFBAN开发组]:()
[签署名称]:前往[/front/public/config/languages.json](languages.json)中找到对应语言下添加`members`内容
[GithubDesktop]:https://docs.github.com/zh/get-started/using-github/github-desktop
