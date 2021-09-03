<template>
  <div class="container">
    <div class="content">
      <div class="ivu-alert-with-banner home-banner" style="background-image: url('assets/images/index-bk.png')">
        <Row>
          <Col :xs="{span: 22, offset: 1}" :sm="12" :md="12" :lg="{span: 8, offset: 0}">
            <h1 class="title"><Icon type="md-lock" /> 联BFBAN</h1>
            <h3>建立全球作弊玩家档案库，被世界各地服务器使用，杜绝恶意玩家:D</h3>
            <br>
            <p>成为我们一员 - 改变社区环境</p>
            <Divider />

            <router-link :to="{name: 'signup'}">
              <Button type="primary" size="large">注册用户</Button>
            </router-link>
            <Divider type="vertical" />
            <router-link :to="{name: 'about'}">
              <Button type="text" size="large"><Icon type="ios-help-circle-outline" />了解有那些社区已经加入</Button>
            </router-link>

            <Row :gutter="10" style="margin-top: 50px">
              <Col span="12">
                <Card>
                  <h3>{{ site.report || 0 }}</h3>
                  <span>已收到</span>
                </Card>
              </Col>
              <Col span="12">
                <Card>
                  <h3>{{ site.cheater || 0 }}</h3>
                  <span>确认作弊者</span>
                </Card>
              </Col>
            </Row>
            <br>
            <p>截止2018年11月4日</p>

          </Col>
          <Col span="16">
            <img src="" width="100%">
          </Col>
        </Row>
      </div>

      <Row :gutter="40">
        <Col :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 8, push: 0, pull: 0}">
          <Card>
            <Row>
              <Col span="12">
                <Icon type="md-chatboxes" size="50" color="#19be6b"/>
              </Col>
              <Col span="12" align="right">
                <div>
                  <h3>新闻</h3>
                  <p>最新动态</p>
                </div>
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
                <Col span="8">
                  <Icon type="md-apps" size="50" color="#ff9900"/>
                </Col>
                <Col span="16" align="right">
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

      <Bulletin />
      <Divider>{{$t("home.activity.title")}}</Divider>

      <Row>
        <Col :xs="{span: 22, push: 1, pull: 1}">
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
        </Col>
      </Row>
    </div>

    <p v-for="m in manager" :key="m.name">
      <a v-if="m.link" target="_blank" :href="m.link">{{ m.name }}</a>
      <span v-else>{{ m.name }}</span>
    </p>

    </div>
</template>

<script>
  import Bulletin from '@/components/Bulletin.vue';
  import { getCheaterStatusLabel, getGameLabel } from '@/mixins/common';
  import ajax from '@/mixins/ajax';
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
  components: {
    Bulletin,
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
    .then(({data}) => {
      const d = data;
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

<style lang="scss">
  .home-banner {
      min-height: 600px;
     background-size: 500px;
     background-repeat: no-repeat;
     background-position:  right;

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
        z-index: -1;
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

