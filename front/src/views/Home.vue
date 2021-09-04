<template>
  <div class="container">
    <div class="content">
      <div class="ivu-alert-with-banner home-banner"
           style="background-image: url('../assets/images/index-bk.png')">
        <Row>
          <Col :xs="{span: 22, offset: 1}" :sm="12" :md="12" :lg="{span: 8, offset: 0}">
            <h1 class="title">
              <Icon type="md-lock"/>
              联BFBAN
            </h1>
            <h3>建立全球作弊玩家档案库，被世界各地服务器使用，杜绝恶意玩家:D</h3>
            <br>
            <p>成为我们一员 - 改变社区环境</p>
            <Divider/>

            <router-link :to="{name: 'signup'}">
              <Button type="primary">注册用户</Button>
            </router-link>
            <Divider type="vertical"/>
            <router-link :to="{name: 'about'}">
              <Button type="text">
                <Icon type="ios-help-circle-outline"/>
                了解有那些社区已经加入
              </Button>
            </router-link>

            <Row :gutter="10" style="margin-top: 50px">
              <Col span="12">
                <Card dis-hover>
                  <h3>{{ site.report || 0 }}</h3>
                  <span>已收到</span>
                </Card>
              </Col>
              <Col span="12">
                <Card dis-hover>
                  <h3>{{ site.cheater || 0 }}</h3>
                  <span>确认作弊者</span>
                </Card>
              </Col>
            </Row>
            <br>
            <p>截止2018年11月4日</p>

          </Col>
          <Col span="16" class="mobile-hide" :lg="{span: 13, push: 3}" type="flex" align="right" justify="center">
            <img src="../assets/images/index-bk.png" width="100%" class="ivu-row-top" style="margin-top: 5rem">
          </Col>
        </Row>
      </div>

      <Row :gutter="40">
        <Col :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 8, push: 0, pull: 0}">
          <Card>
            <Row>
              <Col span="5">
                <Icon type="md-chatboxes" size="50" color="#19be6b"/>
              </Col>
              <Col span="18" align="right">
                <Tooltip class="joinBFbanTip">
                  <div>
                    <h3>参与</h3>
                    <p>您或组织都可以加入BFBAN</p>
                  </div>
                  <div slot="content" max-width="500">
                    <p>个人用户在BFBAN注册并投递举报，</p>
                    <p>
                      如果您是组织代表，希望加入BFBAN可通过第三方工具申请获得服务集群管理账户
                    </p>
                  </div>
                </Tooltip>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 8, push: 0, pull: 0}">
          <Card>
            <Row>
              <Col span="12">
                <Icon type="ios-bookmark" size="50" color="#2d8cf0"/>
              </Col>
              <Col span="12" align="right">
                <div>
                  <h3>文档</h3>
                  <p>对外公开Api文档</p>
                </div>
              </Col>
            </Row>
          </Card>
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
            <h5 align="left">数以千计的玩家和组织已经在他们的BFBAN中贡献与使用</h5>
          </Col>
          <Col span="16" :lg="{span: 13, push: 3}" type="flex" align="right" justify="center">
            <router-link :to="{name: 'cheaters'}">
<!--              <i-switch v-model="activitySwitchType"/>-->
              <Button type="dashed">查阅更多</Button>
            </router-link>
          </Col>
        </Row>
      </div>
      <div v-if="activitySwitchType" class="lean-box">
        <div class="wrapper" :style="'animation: rowup ' + activities.length * .8 + 's linear infinite;'">
          <div class="icon-pair" v-for="activity in activities_l" :key="activity.id">
            <Card class="icon" v-for="a_i in activity" :key="a_i.value">
              <div align="center" style="margin-top: -80px">
                <Avatar size="80">{{ a_i.username[0] }}</Avatar>
                <p>
                  {{ a_i.username }}
                  <Divider type="vertical"/>
                  <Time v-if="a_i.createDatetime" :time="a_i.createDatetime"></Time>
                </p>
              </div>
              <span v-if="a_i.type === 'report'">
                <router-link :to="{name: 'account', params: {uId: `${a_i.uId}`}}">{{
                    a_i.username
                  }}</router-link>
                举报了
                <Tag>
                  {{ handleGameName(a_i.game) }}
                </Tag>
                <router-link
                  :to="{name: 'cheater', params: {game: `${a_i.game}`, ouid: `${a_i.originUserId}`}}">{{
                    a_i.cheaterOriginId
                  }}</router-link>
              </span>

              <span v-if="a_i.type === 'register'">
                <router-link :to="{name: 'account', params: {uId: `${a_i.uId}`}}">{{
                    a_i.username
                  }}</router-link>
                注册了 bfban ，
                欢迎！
              </span>

              <span v-if="a_i.type === 'verify'">
                <Tag color="success">管理员</Tag>
                <router-link :to="{name: 'account', params: {uId: `${a_i.uId}`}}">{{
                    a_i.username
                  }}</router-link>
                将
                <router-link :to="{name: 'cheater', params: {ouid: `${a_i.originUserId}`}}">{{
                    a_i.cheaterOriginId
                  }}</router-link>
                处理为
                <Tag color="warning">
                  {{ handleStatus(a_i.status) }}
                </Tag>
              </span>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {http, api, conf} from '../assets/js/index'
// import Bulletin from "@/components/Bulletin.vue";
import {getCheaterStatusLabel, getGameLabel} from "@/mixins/common";
import _ from "lodash";

export default {
  data() {
    return {
      site: {},
      activities: [],
      activities_l: [],
      activitySwitchType: true,
    }
  },
  components: {
    // Bulletin,
  },
  methods: {
    handleStatus: getCheaterStatusLabel,
    handleGameName: getGameLabel,
  },
  created() {
    http.get(api["activity"], {}).then(({data}) => {
      const d = data;
      if (d.error === 0) {
        let {registers, reports, verifies, number} = d.data;

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
        let new_activities = [];

        activities = _.sortBy(activities, (v) => {
          return (new Date(v.createDatetime)).getTime();
        }).reverse();

        // slice array
        for (let i = 0; i < activities.length; i += 3) {
          new_activities.push(activities.slice(i, i + 3));
        }

        this.activities_l = new_activities;
        this.activities = activities;

        this.site = number;
      }
    })
  }
}
</script>

<style>
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
</style>
<style lang="scss">
.joinBFbanTip .ivu-tooltip-inner {
  white-space: normal;
}
</style>
