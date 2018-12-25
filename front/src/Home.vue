<template>
  <div class="container">
    <div class="content">
      <Alert type="warning">
        bfban.com 已经可以永久追踪被举报挂壁的游戏ID，展示历史ID，并支持历史ID搜索！欢迎大家积极举报，给挂壁留下案底，使他们无处遁形。
      </Alert>
      <Divider>{{$t("home.activity.title")}}</Divider>

      <p>bfban.com  于 2018年11月4日 上线，收到 <b>{{ site.report }}</b> 次举报，已石锤了 <b>{{ site.cheater }}</b> 个挂壁，感谢大家的共同努力！</p>
      <table>
        <tbody>
          <tr v-for="activity in activities" :key="activity.id">
            <td nowrap>
              <Time v-if="activity.createDatetime" :time="activity.createDatetime"></Time>
            </td>
            <td v-if="activity.type === 'report'">
              <span>
                <router-link :to="{name: 'account', params: {uId: `${activity.uId}`}}">{{ activity.username }}</router-link>
                举报了
                <Tag>
                  {{ handleGameName(activity.game) }}
                </Tag>
                <router-link :to="{name: 'cheater', params: {game: `${activity.game}`, ouid: `${activity.originUserId}`}}">{{ activity.cheaterOriginId }}</router-link>
              </span>

            </td>

            <td v-if="activity.type === 'register'">
              <span>
                <router-link :to="{name: 'account', params: {uId: `${activity.uId}`}}">{{ activity.username }}</router-link>
                注册了 bfban ，
                欢迎！
              </span>

            </td>

            <td v-if="activity.type === 'verify'">
              <span>
                <Tag color="success">管理员</Tag>
                <router-link :to="{name: 'account', params: {uId: `${activity.uId}`}}">{{ activity.username }}</router-link>
                将
                <router-link :to="{name: 'cheater', params: {ouid: `${activity.originUserId}`}}">{{ activity.cheaterOriginId }}</router-link>
                处理为
                <Tag color="warning">
                  {{ handleStatus(activity.status) }}
                </Tag>
              </span>

            </td>
          </tr>
        </tbody>
      </table>

    </div>
    <div class="content">
      <Divider>{{$t("home.howToUse.title")}}</Divider>

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
      <p v-for="m in manager" :key="m.name">

        <a v-if="m.link" target="_blank" :href="m.link">{{ m.name }}</a>
        <span v-else>{{ m.name }}</span>
      </p>


      <h2>{{$t("home.howToUse.tools")}}</h2>
      <div class="tools">
        <p>
          <a target="_blank" href="https://battlefieldtracker.com/">
            battlefieldtracker.com
          </a>
          在线战绩查询网站，可以详细查询到各类数据
        </p>
        <p>
          <a target="_blank" href="http://bf1stats.com">
            bf1stats.com
          </a>
          另一个战地1战绩查询站点
        </p>
        <p>
          <a target="_blank" href="https://bf1.mygoare.com/">
            战地1外挂举报助手
          </a>
          在线生成举报文本
        </p>
        <p>
          <a target="_blank" href="https://www.bfrep.com">
            BFReportTools
          </a>
          一款玩家自制的战地举报工具它可以实现一键生成举报文本，自动发送举报文本给EA等功能等
        </p>
      </div>

      <h2>{{$t("home.howToUse.qqGroup")}}</h2>
      <div class="tools">
        <p>
          联ban局投诉审查处QQ群
          <a target="_blank" href="https://jq.qq.com/?_wv=1027&k=5PEqoDb">
            527565465
          </a>
        </p>
      </div>
    </div>
  </div>



</template>

<script>
  import { getCheaterStatusLabel, getGameLabel } from './common';
  import ajax from './ajax';
export default {
  data() {
    return {
      site: {},
      activities: [],
      manager: [
        {
          name: '',
          link: '',
          desc: '',
        }
      ]
    }
  },
  methods: {
    handleStatus: getCheaterStatusLabel,
    handleGameName: getGameLabel,
  },
  created() {
    ajax({
      method: 'get',
      url: '/activity',
    })
    .then(res => {
      const d = res.data;
      if (d.error === 0) {
        let { registers, reports, verifies, number } = d.data;

        reports = _.each(reports, (v, k, l) => {
          v['type'] = 'report'
        });
        registers = _.each(registers, (v, k, l) => {
          v['type'] = 'register'
        });
        verifies = _.each(verifies, (v, k, l) => {
          v['type'] = 'verify'
        });

        let activities = [].concat(verifies, reports, registers);

        activities = _.sortBy(activities, (v) => {
          return (new Date(v.createDatetime)).getTime();
        }).reverse();

        this.activities = activities;

        this.site = number;
      }
    })
  }
}
</script>

