# 翻译流程 (ZH)

很感谢对于网站翻译有兴趣，在参与翻译贡献之前，请务必阅读一些需要知道的条件

* 阅读此文章可能第一次接触翻译工作用户，如果你清楚可以跳过一些流程
* 此文章尽可能的使用可视化操作
----

## 准备

### 准备一个github账户
前往github.com上注册，你可以查看[github教程](https://docs.github.com/zh/get-started/signing-up-for-github/signing-up-for-a-new-github-account)

### 克隆[克隆]

前往[项目](https://github.com/BFBAN/bfban-website)，在页面右上角点击`Fork`到你的个人中，完成操作后前往您自身账户下找到此仓库，并下载到本地，如果你是初次接触，这里推荐你使用[GithubDesktop]，当然您是资深开发者，可以使用ide来拉取本地。

简单的说明:

- push: 提交，从本地提交到远程仓库
- pull: 拉取,从远程下载到本地


## 翻译

### 1.现有翻译

前往/front/src/lang找到对应语言修改

如果你是第一次参与翻译工作，请不要忘记[签署名称]

### 2.启动新的翻译

在[此处](/front/src/lang/zh_CN.json)找到`zh.json`(我们以zh.json为蓝本来翻译，所有语言都基于zh.json拓展)，拷贝粘贴一个新的.json文件,命名规则以Locale Id来命名，以中文繁体来例子:

```
// 斜杠前为小写，斜杠后为大写
// 台湾
zh-TW.json

// 其他例子印度语
en-IN.json
```

命名好后，你就可以立即开始着手翻译

新增的翻译内容，请不要忘记在`languages.json`中新增新的语言，来[签署名称]，你可以参考`zh`字段结构

## 规则

- (重要)翻译基础由zh.json拓展
- 你所编辑的翻译json与:
  1. zh.json内没有的字段应该删除，通常上被遗弃.
  2. 存在格式冲突，应当遵循zh.json格式为准.
  3. zh.json对比的字段存在遗漏，请所翻译的成员补全.

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

打开[GithubDesktop]，在界面中检查Current Repository是否为bfban-website

查看`changes`列表，勾选添加提交的文件，填写summary和description，最后推送到仓库中,[教程](https://docs.github.com/zh/desktop/contributing-and-collaborating-using-github-desktop/making-changes-in-a-branch/pushing-changes-to-github)

现在还差一步将个人仓库的代码推到BFBAN下，你需要前往[这里](https://github.com/BFBAN/bfban-website/pulls)，点击右边创建一个新Pull请求

```
 BFBAN/bfban-website master <- YOU GIT/bfban-website master
```

在检查上方拉取对象以及分支无误后，创建, 进入本次pull详情内请在PR右边找到审稿人，添加@Cabbagelol与@Lin_RunRun, 否则我们无法及时发现审查, 对应新的语言翻译需要对程序维护，因此无法立即呈现

----

[克隆]:克隆所指，将在BFBAN组织下的bfban-website仓库克隆到您账户下, 克隆的项目与BFBAN下bfban-website互相独立

[签署名称]:前往[/front/public/config/languages.json](languages.json)中找到对应语言下添加`members`内容
[GithubDesktop]:https://docs.github.com/zh/get-started/using-github/github-desktop
