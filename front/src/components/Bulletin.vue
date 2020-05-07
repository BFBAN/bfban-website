<template>
  <div class="content">
      <Divider>{{$t("home.bulletin.title")}}</Divider>
    
      <div class="md" v-html="data"></div>

  </div>
</template>

<script>
  export default {
    data() {
      return {
        data: marked(`
bfban.com 网站上线以来得到很多热心玩家的帮助与支持，同时我们也收到很多正面或负面的反馈，

网站到现在也经过一段时间数据的的积累沉淀，但也出现了很多的问题。

现在基于一些玩家的反馈，我们将陆续做以下尝试性的改变，并一步步进行技术开发部署：


* 加大玩家的参与度，将 bfban.com 中被举报玩家 是否作弊的评判权 交与 玩家判断，大弱化管理员判挂的所谓“权威”形象，具体参考豆瓣评分投票模式
* 管理员参与评判 权重和普通玩家一样，只是 管理员的评判会高亮展示
* 玩家(包括管理员)的评判与发言 可以 被赞 或 被踩，赞踩的多少会一定程度影响展示的排名，具体参考 stackoverflow
* 活跃老玩家可以 申请成为管理员
* 管理员可能会对 恶意玩家 进行制裁


以上，敬请期待！

#### 特别说明：
由于目前 bfban.com 域名与服务器在国外，所以可能会出现 很多玩家反馈的慢、刷不出来、提交半天没反应等不尽人意的用户体验，
这里只能请大家多担待，或者 请挂代理访问 bfban.com。

以下是开发者邮箱，有任何想法或技术相关的问题可以联系我
mygoare@gmail.com
        `, {breaks: true, gfm: true, smartLists: true})
      }
    }
  }
</script>

<style lang="scss">
  .md {
    ul {
      margin-left: 1rem;
    }
    p {
      margin: .4rem 0;
    }
  }
</style>