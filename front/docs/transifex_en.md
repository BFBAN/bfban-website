# Transifex Translation Process (EN)

Thank you for your interest in website translation, please be sure to read some conditions you need to know before participating in translation contributions.

* Reading this article may be the first time to contact translation work users, if you are clear, you can skip some processes.
* This article uses visual operations as much as possible.
----

## Prepare

### Prepare a Transifex account
Go to [transifex.com](https://transifex.com) to register, you can also use a third party to log in directly (such as GitHub, Google, etc.).

### Join Project

[BFBAN WebSite Project](https://app.transifex.com/bfban/bfban-website)

[BFBAN App Project](https://explore.transifex.com/bfban/bfban-app-mobile/)

After clicking the above link, choose to join the project, fill in your [Main Translation Language](), and then choose to continue, and wait for [BFBAN Development Team] to agree to your translation request. (After agreeing, an email will be sent to your account mailbox).

 - Note: If you want to become a BFBAN translation specialist, please contact the BFBAN development team, and members of the development team will grant you the authority of a translator. You can translate more languages and add new languages. (You can only translate without applying for a translator the main translation language for each of your projects).
              
 - Main translation language: refers to your first translation language, that is, the language you are best at.


## Translate

### 1.Existing Translation

If you are working on a translation for the first time, please don't forget to [sign name].

Enter the information panel of Transifex, select the language you want to translate, click translate to enter [Editor](https://app.transifex.com/bfban/editor/).
              
We can see all fields, fields to be translated and fields to be reviewed.
              
Click the field you want to translate, fill in the corresponding translated content in the translation area in the middle, and then click the Save Translation button (or use the Alt+Enter button to save).
              
The translated content can be corrected and modified, just edit the fields that need to be modified.

### 2.Start A New Translation

You must be a BFBAN translation specialist to add new languages!

If you are a BFBAN translation specialist, you can go to the project information panel, choose to apply for a new language, fill in the corresponding language and click Apply, [BFBAN Development Team] will receive your request and process it as soon as possible.
              
New languages, please don’t forget to add new languages in `languages.json` in the GitHub repository, to [Sign Name], you can refer to `zh` field structure.

## Translation Rules

- (Important) Translation base expanded by zh_CN.
- The language of the new application is recommended to be a commonly used international language, and it is not recommended to apply for a minority language.

### SEO Translation Rules

SEO refers to the algorithm of the search engine, which adds keywords to the engine; usually including `seo` under a certain field means that this field is a separate page.

- SEO must consist of `description` and `keywords`
   - `description` description, please follow zh.json for local description
   - There are multiple values of the `keywords` field, which should be separated by ','

## Sign Name

```json
{
  "name": "zh-CN", // Local id
  "label": "简体中文", // Show Lang Name
  "main": false,
  "members": [
    // Add here
    {
      "name": "You name",
      "url": "Your online address, can be github, website, display page"
    }
  ]
}
```

## Submit

After you have 100% completed the translation of a language, wait for [BFBAN development team] or [translation specialist](https://app.transifex.com/bfban/teams/) to review. When all fields are reviewed, Transifex The translated content will be automatically synchronized to the GitHub warehouse. The corresponding new language translation requires program maintenance, so it cannot be synchronized to the BFBAN WebSite immediately.

----

[BFBAN development team]:()
[Sign Name]:前往[/front/public/config/languages.json](languages.json)中找到对应语言下添加`members`内容
[GithubDesktop]:https://docs.github.com/zh/get-started/using-github/github-desktop
