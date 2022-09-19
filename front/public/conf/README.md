## 目录

1. /fonts 字体
2. /images 媒体
3. /js  脚本

---

## json

在配置文件下通常不包含`国际化`，都由/src/lang/下完成，除了类似appslist这种需要第三方参与配置文件，提供了lang参数外，都不应该包含多国语言。

#### action.json 
作弊者对应的作弊行为，如透视...
- value: 行为名称，同时作为key; 对应后台key与置换翻译key
- privilege: 该判决所需身份


#### cheaterStatus.json 
举报玩家状态，裁判结果(数字)
- value: 玩家状态，由后端返回(注意与action、cheatMethodsGlossary区别)
- values: 玩家状态集，可能多个，对应旧版本举报玩家的key，置换到新`value`中，再从`value`取得翻译文本;

#### cheatMethodsGlossary.json 
作弊方式词汇表
- value: 作弊方式key，同时作为key

* 注意: appslist、cheaterStatus、cheatMethodsGlossary都是互相独立的

----

#### appslist.json
路由/apps下应用配置，用于呈现第三方应用

#### footerNavs.json 
网站底部导航配置

#### gameName.json 
游戏类型配置

#### headerMenu.json 
导航菜单

#### link.json 
链接配置，被不同页面使用

#### message.json 
消息配置

#### privilege.json 
身份配置，翻译在/lang下

#### requestConf.json 
根请求配置文件

#### tells.json 
首页的对BFBAN评价，区分语言

#### themes.json 
主题配置文件，主题文件请放置在/public目录下