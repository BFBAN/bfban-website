<template>
  <div>
    <img class="logo" src="https://i.loli.net/2018/11/03/5bdd8e977b10d.png" alt="">

    <Divider>关于</Divider>

    <h1>联BAN调查局</h1>
    <p>
      诞生于2018年1月29日；
      是战地玩家一起组建的 <b>抵制外挂</b> 组织。
    </p>
    <p>
      目前主要由下列力量组成：
      <b>私服主人</b> ，<b>战队队长</b> 以及 <b>战地UP</b>；      创始人是CDN战队队长凯撒Caesar。
    </p>
    <p>
      联BAN局创建以来，
      联合诸多玩家一起抵制外挂，
      成功打击了近500名外挂和外挂主播；
      抵制外挂之战，不仅在游戏内，更是一场敌暗我明的幕外战争。
    </p>
    <br>
    <p>
      <b>目前加盟服务器，共 {{data.length}} 个：</b>
      （ 搜索 <b>LB</b> 都可以找到加入联BAN局的服务器 ）
    </p>
    <ul>
      <li v-for="d in data">
        {{ d }}
      </li>
    </ul>
    <br>
    <b>
      联ban审核流程如下：
    </b>
    <p>
      如果遇到挂，可以先使用

      <a target="_blank" href="https://bf1.mygoare.com/">
        战地1外挂举报助手
      </a>

      给官方举报后，再给我们举报（ 最好提供截图、视频证据，视频发B站，给我们链接 ）。
    </p>
    <p>
      或者 自己在网站注册后，自己举报，我们会有管理员定期审核；你也可以在网站上
      <a href="/#/cheaters?status=1">查看</a>
      到。
    </p>

    <br>
    <p>
      <a target="_blank" href="https://jq.qq.com/?_wv=1027&k=5PEqoDb">
        联ban局投诉审查处QQ群 527565465
      </a>
    </p>
    <br>

    <p>
      其他的生活琐事，还有涉及政治等话题，请不要在群里说，同时禁止引战。
    </p>
    <p>
      在什么地方说什么话，违者禁言，严重者踢出。另外注明:联ban不光禁挂，恶意搞事骂人的，种族歧视的，还有不是挂非说自己是挂的，都给安排。
    </p>
    <br>

    <p>
      <b>本站管理员：</b>
    </p>
    <ul>
      <li v-for="m in manager">

        <a v-if="m.link" target="_blank" :href="m.link">{{ m.name }}</a>
        <span v-else>{{ m.name }}</span>
      </li>
    </ul>

    <Divider>小工具</Divider>
    <div class="tools">
      <p>
        <a target="_blank" href="https://battlefieldtracker.com/">
          在线战绩查询
        </a>
      </p>
      <p>
        <a target="_blank" href="https://bf1.mygoare.com/">
          战地1外挂举报助手
        </a>
      </p>
      <p>
        <a target="_blank" href="http://bf1ban.github.io/images/report.rar">
          战地1外挂举报助手本地版
        </a>
      </p>
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      data: [
        '1975',
        'CDN',
        'FATE',
        'HS',
        'SAK',
        'TNT',
        'Mua',
        'More27',
        'XJBD',
        'CNH',
        'KOI',
        'RUSH',
        'BOA',
        'pb',
        'coco',
        'WSG',
        'Lion',
        'Lowb',
        'kosuzu',
      ],
      manager: [
        {
          name: 'Baidu',
          link: 'https://www.baidu.com',
          desc: '我是百度',
        },
        {
          name: 'Bilibili',
          link: '',
          desc: '',
        }
      ]
    }
  }
}
</script>

<style scoped>
  b {
    font-size: 1rem;
  }
  .logo {
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 10rem;
  }
  ul li {
    list-style: none;
    margin: .2rem 0;
  }
  .tools p {
    margin: .2rem 0;
  }
</style>

