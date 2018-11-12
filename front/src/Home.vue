<template>
  <div>
    <b>
      如何使用本站：
    </b>
    <p>如果遇到挂，可以</p>
    <p>
      1、先使用

      <a target="_blank" href="https://bf1.mygoare.com/">
        战地1外挂举报助手
      </a>

      给官方举报
    </p>
    <p>
      2、自己在网站
      <router-link :to="{path: 'signup'}">注册</router-link>
      后，自己
      <router-link :to="{path: 'report'}">举报</router-link>
      ；
      我们会有管理员定期审核。
    </p>
    <p>
      期间 你可以在 个人中心 查看进度状态， 也可以翻看
      <a href="/#/cheaters?status=1">外挂公示</a>
      。
    </p>

    <p>
      <!--<b>本站管理员：</b>-->
    </p>
    <p v-for="m in manager">

      <a v-if="m.link" target="_blank" :href="m.link">{{ m.name }}</a>
      <span v-else>{{ m.name }}</span>
    </p>

    <b>小工具</b>
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
    <b>QQ群</b>
    <div class="tools">
      <p>
        <a target="_blank" href="https://jq.qq.com/?_wv=1027&k=5PEqoDb">
          联ban局投诉审查处QQ群 527565465
        </a>
      </p>
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      manager: [
        {
          name: '',
          link: '',
          desc: '',
        }
      ]
    }
  }
}
</script>

