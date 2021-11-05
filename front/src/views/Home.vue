<template>
  <div class="container">
    <div class="content">
      <div class="ivu-alert-with-banner home-banner"
           style="background-image: url('../assets/images/index-bk.png')">
        <Row>
          <Col :xs="{span: 22, offset: 1}" :sm="12" :md="12" :lg="{span: 8, offset: 0}">
            <h1 class="title">
              <Icon type="md-lock"/>
              {{ $t("home.cover.h1") }}
            </h1>
            <h2>{{ $t("home.cover.h2")[Math.floor(Math.random() * 2)] }}</h2>
            <h3>{{ $t("home.cover.h3") }}</h3>
            <br>
            <p>{{ $t("home.cover.h4") }}</p>
            <Divider/>

            <router-link :to="{name: 'signup'}">
              <Button type="primary">{{ $t("signup.title") }}</Button>
            </router-link>
            <Divider type="vertical"/>
            <router-link :to="{name: 'about'}">
              <Button type="text">
                <Icon type="ios-help-circle-outline"/>
                {{ $t("home.cover.subButton") }}
              </Button>
            </router-link>
            <Row :gutter="10" style="margin-top: 50px">
              <Col span="12">
                <Card dis-hover>
                  <h3>{{ statistics.reports || 0 }}</h3>
                  <span>{{ $t("home.cover.dataReceived") }}</span>
                </Card>
              </Col>
              <Col span="12">
                <Card dis-hover>
                  <h3>{{ statistics.confirmed || 0 }}</h3>
                  <span>{{ $t("home.cover.confirmData") }}</span>
                </Card>
              </Col>
            </Row>
            <br>
            <p>{{ $t("home.cover.endTime") }}</p>
            <br>
          </Col>
          <Col span="16" class="mobile-hide" :lg="{span: 13, push: 3}" type="flex" align="right" justify="center">
            <img src="../assets/images/webp.webp" width="100%" class="ivu-row-top" style="margin-top: 5rem">
          </Col>
        </Row>
      </div>

      <Row :gutter="20">
        <Col :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 8, push: 0, pull: 0}">
          <a href="https://manager.gametools.network/" target="_blank">
            <Card>
              <Row>
                <Col span="5">
                  <Icon type="md-chatboxes" size="50" color="#19be6b"/>
                </Col>
                <Col span="18" align="right">
                  <Tooltip class="joinBFbanTip" :max-width="300" content="集群服务器管理与作弊检测、监控、机器人">
                    <div>
                      <h3>集群管理与检测</h3>
                      <p>Gametools & BFBan</p>
                    </div>
                  </Tooltip>
                </Col>
              </Row>
            </Card>
          </a>
        </Col>
        <Col :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 8, push: 0, pull: 0}">
          <a href="scriptjava:void(0)">
            <Card>
              <Row>
                <Col span="12">
                  <Icon type="ios-bookmark" size="50" color="#2d8cf0"/>
                </Col>
                <Col span="12" align="right">
                  <div>
                    <h3>Wiki</h3>
                    <p>联BAN百科</p>
                  </div>
                </Col>
              </Row>
            </Card>
          </a>
        </Col>
        <Col :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 8, push: 0, pull: 0}">
          <router-link :to="{name: 'apps'}">
            <Card>
              <Row>
                <Col span="5">
                  <Icon type="md-apps" size="50" color="#ff9900"/>
                </Col>
                <Col span="18" align="right">
                  <div>
                    <h3>工具</h3>
                    <p>整合BFBAN数据库第三方</p>
                  </div>
                </Col>
              </Row>
            </Card>
          </router-link>
        </Col>
      </Row>
    </div>

    <div class="box mobile-hide">
      <div class="container">
        <Row>
          <Col :lg="{span: 10, push: 0}">
            <h1 align="left">{{ $t("home.activity.title") }}</h1>
            <h5 align="left">
              {{ $t('home.activity.description', {report: statistics.reports || 0, cheater: statistics.confirmed || 0}) }}
            </h5>
          </Col>
          <Col :lg="{span: 11, push: 3}" type="flex" align="right" justify="center">
            <router-link :to="{name: 'cheaters'}">
<!--              <i-switch v-model="activitySwitchType"/>-->
              <Button type="dashed">
                {{$t('home.activity.more')}}
              </Button>
            </router-link>
          </Col>
        </Row>
      </div>
      <div v-if="activitySwitchType" class="lean-box">
        <div class="wrapper" :style="'animation: rowup ' + activities_l.length * .8 + 's linear infinite;'">
          <div class="icon-pair" v-for="activity in activities_l" :key="activity.id">
            <Card class="icon" v-for="a_i in activity" :key="a_i.id">
              <div align="center" style="margin-top: -80px">
                <Avatar size="80">{{ a_i.username || a_i.byUserName || a_i.toPlayerName || 'null' }}</Avatar>
                <p>
                  <br>
                  <Tag color="success" v-if="a_i.type == 'judgement'">
                    {{$t("account.admin")}}
                  </Tag>
                  {{ a_i.username || a_i.byUserName || a_i.toPlayerName || 'null' }}
                  <Divider type="vertical"/>
                  <Time v-if="a_i.createTime" :time="a_i.createTime"></Time>
                </p>
              </div>

              <span v-if="a_i.type === 'report'">
                <router-link :to="{name: 'account', params: {uId: `${a_i.byUserId}`}}">
                  {{a_i.byUserName }}
                </router-link>
                {{$t('home.activity.activities.report', {msg: 'report'})}}
                <Tag>
                  {{ getGameLabel(a_i.game) }}
                </Tag>
                <router-link
                  :to="{name: 'cheater', params: {game: `${a_i.game}`, ouid: `${a_i.originUserId}`}}">
                  {{a_i.toPlayerName }}
                </router-link>
              </span>

              <span v-if="a_i.type === 'register'">
                <router-link :to="{name: 'account', params: {uId: `${a_i.byUserId}`}}">
                  {{ a_i.byUserName }}
                </router-link>
                {{$t('home.activity.activities.join', {msg: 'join'})}}
              </span>

              <span v-if="a_i.type === 'verify' || a_i.type === 'judgement'">
                <router-link :to="{name: 'account', params: {uId: `${a_i.byUserId}`}}">
                  <Tag v-if="a_i.privilege === 'admin'" color="success">
                    {{ $t('detail.info.administrator', {msg: 'administrator'}) }}
                  </Tag>
                  <b>{{ a_i.byUserName }}</b>
                </router-link>

                {{ $t('detail.info.judge', {msg: 'judge'}) }}

                <router-link :to="{name: 'cheater', params: {ouid: `${a_i.toPlayerId}`}}">
                  {{a_i.toPlayerName }}
                </router-link>

                <Tag color="warning">
                  {{ getCheaterStatusLabel(a_i.action) }}
                </Tag>

                <span v-if="a_i.cheatMethods">
                  ，{{ $t('detail.info.cheatMethod', {msg: 'cheatMethod'}) }}
                  <b>{{ convertCheatMethods(a_i.cheatMethods) }}</b>
                </span>

                <!--                <router-link :to="{name: 'account', params: {uId: `${a_i.byUserId}`}}">-->
                <!--                  {{a_i.byUserName }}-->
                <!--                </router-link>-->

                <!--                {{ $t('detail.info.judge', {msg: 'judge'}) }}-->

                <!--                <router-link :to="{name: 'cheater', params: {ouid: `${a_i.toPlayerId}`}}">-->
                <!--                  {{a_i.toPlayerName }}-->
                <!--                </router-link>-->

                <!--                <Tag color="warning">-->
                <!--                  {{a_i.action}}{{ getCheaterStatusLabel(a_i.action) }}-->
                <!--                </Tag>-->
              </span>
            </Card>
          </div>
        </div>
      </div>
    </div>

    <Tell class="mobile-hide"></Tell>
  </div>
</template>

<script>
import BFBAN from "../assets/js/bfban";
import Tell from "../components/Home_tell";
import {api, http, util} from '../assets/js/index'

export default new BFBAN({
  data() {
    return {
      site: {
        report: 0,
        cheater: 0
      },
      activities: [],
      activities_l: [],
      statistics: {},
      activitySwitchType: true,
    }
  },
  components: {Tell},
  watch: {
    '$route': 'loadData',
  },
  created() {
    this.loadData();
    this.getStatisticsInfo();
    this.getActivity();
  },
  methods: {
    getCheaterStatusLabel: util.getCheaterStatusLabel,
    convertCheatMethods: util.convertCheatMethods,
    getGameLabel: util.getGameLabel,
    async loadData() {
      await util.initUtil().then((res) => {
        this.cheaterStatus = res.cheaterStatus;
        this.cheatMethodsGlossary = res.cheatMethodsGlossary;

        this.gameName = res.gameName;
      });
    },
    getActivity () {
      http.get(api["activity"], {}).then((res) => {
        const d = res.data;
        if (d.success === 1) {
          let activities = d.data;
          let new_activities = [];

          // slice array
          for (let i = 0; i < activities.length; i += 3) {
            new_activities.push(activities.slice(i, i + 3));
          }

          this.activities_l = new_activities;
          // this.activities = activities;

          // this.site = number;
        }
      })
    },
    getStatisticsInfo () {
      http.get(api["statistics"], {
        params: {
          reports : 'show', // show reports number
          players : true,	// show players that is reported number
          confirmed : true,	// show confirmed number
          registers : true,	// show register number
          banappeals : true,// show ban appeals number
          details : true,	// show number of each game, each status
          from : new Date('2018-01-01').getTime()
        }
      }).then((res) => {
        const d = res.data;
        if (d.success === 1) {
          this.statistics = d.data;
        }
      })
    }
  }
})
</script>

<style lang="less">
@keyframes rowup {
  from {
    transform: translateX(0%);
  }

  to {
    transform: translateX(-50%);
  }
}

.box {
  background: #f3edff;
  padding-top: 100px;
  overflow: hidden;
  height: 800px;
  margin: 100px -25% 0 -25%;
  text-align: center;
}

.lean-box {
  display: flex;
  transform: rotate(-5deg);
  margin-top: 50px;
}

.wrapper {
  margin-top: 40px;
  display: flex;
  flex-wrap: nowrap;
}

.wrapper .icon {
  font-size: 12px;
  width: 250px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transform: translateX(0) translateY(40px);
}

.wrapper .icon:nth-child(even) {
  margin-top: 105px;
  margin-left: 45px;
  transform: translateX(45px) translateY(-10px);
}
</style>

<style lang="scss" scoped>
.home-banner {
  min-height: 600px;
  background-size: 500px;
  background-repeat: no-repeat;
  background-position: right;

  .title {
    position: relative;
    margin-top: 100px;
    border-bottom: 9px solid #fff13c;
    display: inline-flex;
    padding-left: 20px;
    margin-bottom: 20px;
    font-size: 3rem;

    &:after {
      position: absolute;
      opacity: .6;
      border-radius: 50%;
      z-index: 0;
      top: -20px;
      right: -30px;
      display: block;
      content: '';
      width: 50px;
      height: 50px;
      background-color: #401486;
    }
  }
}

.joinBFbanTip .ivu-tooltip-inner {
  white-space: normal;
}
</style>
