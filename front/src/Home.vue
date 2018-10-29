<template>
  <div>
    <img class="logo" src="https://bf1.likeqi.cn/images/avatar.png" alt="">

    <Divider>关于</Divider>

    <h1>战地联ban局</h1>
    <p>
      由大陆多个私服服主联合发起，旨在作为官方封禁的有效补充联合封杀外挂用户，为真正的玩家创造良好公平的娱乐环境。
    </p>
    <br>
    <p>
      <b>目前加盟服务器，共 {{data.length}} 个：</b>
      （搜索LB都可以找到加入联BAN局的服务器）
    </p>
    <ul>
      <li v-for="d in data">
        {{ d }}
      </li>
    </ul>
    <br>
    <p>
      <b>
        联ban审核流程如下…
      </b>
    </p>
    <p>
      如果遇到挂，可以先给官方举报后，再给我们举报(最好提供视频证据，视频发B站，给我们连接)。其他的生活琐事，还有涉及政治等话题，请不要在群里说，同时禁止引战。
    </p>
    <br>
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
        <a target="_blank" href="https://jq.qq.com/?_wv=1027&k=5PEqoDb">
          联ban局投诉审查处QQ群527565465
        </a>
      </p>
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
        'SF',
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
        'Lowb'
      ],
      manager: [
        {
          name: 'Baidu',
          link: 'https://www.baidu.com'
        },
        {
          name: 'Bilibili',
          link: ''
        }
      ]
    }
  }
}
</script>

<style scoped>
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

