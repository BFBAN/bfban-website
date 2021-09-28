## 目录
/fonts 字体

/images 媒体

/js  脚本

## json

在配置文件下通常不包含`国际化`，都由/src/lang/下完成，除了类似appslist这种需要第三方参与配置文件，提供了lang参数外，都不应该包含多国语言。

action.json 作弊者对应的作弊行为

appslist.json 路由/apps下应用配置，呈现第三方应用

cheaterStatus.json 作弊者状态，裁判结果

cheatMethodsGlossary.json

footerNavs.json 网站底部导航配置

gameName.json 游戏类型配置

headerMenu.json 导航菜单

link.json 链接配置，被不同页面使用

privilege.json 身份配置，翻译在/lang下

requestConf.json 根请求配置文件

tells.json 首页的对BFBAN评价，区分语言

themes.json 主题配置文件，主题文件请放置在/public目录下