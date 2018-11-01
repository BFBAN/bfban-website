<template>
  <div>
    <Divider>Cheater Detail</Divider>
    <div style="display: flex; flex-direction: column;">

      <span style="font-size: 1.6rem;">
        {{ cheater.originId }}
        <sub v-if="!idExist" style="font-size: .6rem; color: #ed4014;">该id已不存在</sub>
      </span>

      <div>
        <Tag color="error">
          {{ handleStatus(cheater.status) }}
        </Tag>

        <Tag color="primary">
          battlefieldtracker
        </Tag>
        <a v-show="idExist" target="_blank" :href="`https://battlefieldtracker.com/bf1/profile/pc/${cheater.originId}`">在线战绩</a>
        <a v-if="cheater.trackerShot" :href="cheater.trackerShot" target="_blank">数据截图</a>
        <a v-if="cheater.trackerWeaponShot" :href="cheater.trackerWeaponShot" target="_blank">武器截图</a>


        <Tag color="primary">
          bf1stats
        </Tag>
        <a v-show="idExist" target="_blank" :href="`http://bf1stats.com/pc/${cheater.originId}`">在线战绩</a>
        <a v-if="cheater.bf1statsShot" :href="cheater.bf1statsShot" target="_blank">数据截图</a>
  </div>
    </div>

    <Divider />

    <div style="position: relative">
      <h2 style="margin: 1rem 0;">时间线</h2>
      <TimelineItem v-for="l in timelineList" :key="l.createDatetime">
        <div class="timeline-time">
          <Time :time="l.createDatetime"></Time>
        </div>
        <div v-if="l.type === 'report'" class="timeline-content">
          <div style="display: flex; align-items: center;">
            <p>
              <b style="font-size: 1rem;">{{l.username}}</b>
              举报

              <Tag color="warning">
                {{convertCheatMethods(l.cheatMethods || '')}}
              </Tag>

            </p>
            <p v-if="l.bilibiliLink">
              <Tag color="primary">
                b站视频
              </Tag>
              <a :href="l.bilibiliLink" target="_blank">{{ l.bilibiliLink }}</a>
            </p>
          </div>

          <div v-if="l.description" v-html="l.description" class="description">
          </div>
        </div>


        <div v-if="l.type === 'verify'" class="timeline-content bookmark" :id="`user-verify-cheater-${l.id}`">
          <p>
            管理员
            <b style="font-size: 1rem;">{{l.username}}</b>
            认为
            <Tag color="warning">
              {{ handleStatus(l.status) }}
            </Tag>

            <span v-if="l.cheatMethods">
              ，
              作弊方式
              <Tag color="warning">
                {{convertCheatMethods(l.cheatMethods || '')}}
              </Tag>
            </span>
          </p>
          <div v-html="l.suggestion" class="description"></div>


          <br>
          <a href="#"
            v-show="isAdmin && cheater.status !== '1' && l.status === '1' && !isSelf(l.userId)"
            @click.prevent.stop="doConfirm"
            :data-user-verify-cheater-id="l.id"
            :data-cheat-methods="l.cheatMethods"
            :data-user-verify-cheater-username="l.username">
            赞同上处理 并 石锤
          </a>
        </div>


        <div v-if="l.type === 'confirm'" class="timeline-content">
          <p>
            管理员
            <b style="font-size: 1rem;">{{l.username}}</b>
            赞同了
            <a @click.stop.prevent="jumpToBookmark" :data-hash="`#user-verify-cheater-${l.userVerifyCheaterId}`">
              # 该决定
            </a>
            ，作弊方式
            <Tag color="warning">
              {{ convertCheatMethods(l.cheatMethods || '') }}
            </Tag>
          </p>
        </div>


      </TimelineItem>

      <Spin size="large" fix v-show="spinShow"></Spin>
    </div>

    <div v-if="isAdmin">
      <Divider />
      <div class="hint">
        Note: 管理员石锤某人后，需要有另一位管理员认同才会被 真正 石锤；期间 若有不同意见的 其它管理员 可以选择其他意见。
      </div>
      <h2 style="margin: 1rem 0;">处理意见</h2>

      <Form :label-width="80" ref='verifyForm'>
        <FormItem label="意见">
          <Select v-model="verify.status">
            <!-- 0=> 待处理，1=> 石锤，2=> 嫌疑玩家再观察，3=> 没有问题不是挂，4=> 捣乱的 -->
            <Option value="0">待处理</Option>
            <Option value="1">石锤</Option>
            <Option value="2">嫌疑玩家再观察</Option>
            <Option value="3">没有问题不是挂</Option>
            <Option value="4">捣乱的</Option>

          </Select>
        </FormItem>

        <FormItem v-show="verify.status === '1'" label="作弊方式">
          <CheckboxGroup v-model="verify.checkbox">
            <Checkbox label="wallhack">
              <span>透视</span>
            </Checkbox>
            <Checkbox label="damageChange">
              <span>改伤</span>
            </Checkbox>
            <Checkbox label="aimbot">
              <span>自瞄</span>
            </Checkbox>
            <Checkbox label="oneShotKill">
              <span>秒杀</span>
            </Checkbox>
            <Checkbox label="gadgetModify">
              <span>改装备</span>
            </Checkbox>
            <Checkbox label="stealth">
              <span>隐身</span>
            </Checkbox>
            <Checkbox label="shootingThroughWalls">
              <span>子弹穿墙</span>
            </Checkbox>
          </CheckboxGroup>
        </FormItem>

        <FormItem label="理由">
          <Input v-model="verify.suggestion" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="必填" />
        </FormItem>

        <FormItem>
            <Button type="primary" @click.stop.prevent="doVerify">提交</Button>
        </FormItem>
      </Form>
    </div>

  </div>
</template>

<script>
import axios from 'axios';
import _ from 'underscore';

export default {
  data() {
    return {
      cheater: {},
      timelineList: [],
      verify: {
        status: '0',
        checkbox: [],
        suggestion: '',
      },
      spinShow: true,
      idExist: true,
    }
  },
  created() {
    axios({
      method: 'get',
      url: `/cheaters/${this.$route.params.uid}`,
    })
    .then((res) => {
      this.spinShow = false;

      const d = res.data;
      this.cheater = d.data.cheater[0];

      let { reports, verifies, confirms } = d.data;

      reports = _.each(reports, (v, k, l) => {
        v['type'] = 'report'
      });
      verifies = _.each(verifies, (v, k, l) => {
        v['type'] = 'verify'
      });
      confirms = _.each(confirms, (v, k, l) => {
        v['type'] = 'confirm'
      });

      let timelineList = reports.concat(verifies, confirms);

      timelineList = _.sortBy(timelineList, (v) => {
        return (new Date(v.createDatetime)).getTime();
      });

      // render timeline
      this.timelineList = timelineList;

      // fetch id exist
      axios({
        method: 'post',
        url: '/checkGameIdExist',
        data: {
          id: this.cheater.originId,
        }
      })
      .then((res) => {
        let d = res.data;

        this.idExist = d.idExist;
      })
    });

  },
  methods: {
    jumpToBookmark(e) {
      let hash = e.target.dataset.hash;
      let el = document.querySelector(hash);

      // offset top 一层层 依次累加
      let offsetY = el.offsetParent.offsetTop + el.offsetParent.offsetParent.offsetTop + el.offsetParent.offsetParent.offsetParent.offsetTop - document.querySelector('header').offsetHeight;

      document.documentElement.scrollTop = offsetY;

      el.setAttribute('style', 'background: rgba(255, 153, 1, 0.15)');
      setTimeout(function() {
        el.setAttribute('style', 'transition: background 1s ease .5s;')
      }, 100);
    },
    handleStatus(status) {
      const statusObj = {
        0: "待处理",
        1: "石锤",
        2: "嫌疑玩家再观察",
        3: "没有问题不是挂",
        4: "捣乱的",
      }

      return statusObj[status]
    },
    convertCheatMethods(str) {
      let s = str || '';
      const list = {
        wallhack: '透视',
        damageChange: '改伤',
        aimbot: '自瞄',
        oneShotKill: '秒杀',
        gadgetModify: '改装备',
        stealth: '隐身',
        shootingThroughWalls: '子弹穿墙',
      };

      // return string
      return s.split(',').map((v, i) => {
        return list[v]
      }).join(' ');
    },
    doVerify() {
      const {status, suggestion} = this.verify;
      const cheaterUId = this.$route.params.uid;
      const cheatMethods = this.verify.checkbox.join(',');

      axios({
        method: 'post',
        url: '/cheaters/verify',
        data: {
          status,
          suggestion,
          cheatMethods,
          cheaterUId,
        }
      })
      .then((res) => {
        const d = res.data;
        if (res.data.error === 0) {
          // reset verifyForm
          this.verify.status = '0'
          this.verify.suggestion = '';
          this.verify.checkbox = [];

          const { id, userId, createDatetime, status, suggestion, username, cheatMethods, privilege } = d.data;

          this.cheater.status = status;

          this.timelineList.push({
            type: 'verify',
            id,
            userId,
            createDatetime,
            status,
            suggestion,
            cheatMethods,
            username,
            privilege,
          });

          this.$Message.success('提交成功');
        } else {
          this.$Message.error('提交失败 ' + d.msg);
        }
      })
    },
    doConfirm(e) {
      const { userVerifyCheaterId, userVerifyCheaterUsername, cheatMethods } = e.target.dataset;
      const { userId } = this.$store.state.user;
      const cheaterUId = this.$route.params.uid;

      axios({
        method: 'post',
        url: '/cheaters/confirm',
        data: {
          userVerifyCheaterId,
          userId,
          cheaterUId,
          cheatMethods,
        }
      })
      .then((res) => {
        let d = res.data;

        if (d.error === 0) {


          const { createDatetime } = d.data;

          this.cheater.status = '1';

          this.timelineList.push({
            type: 'confirm',
            userId,
            userVerifyCheaterId,
            createDatetime,
            cheatMethods,
            username: this.$store.state.user.username,
          })
        }
      })
    },
    isSelf(id) {
      const userId = this.$store.state.user.userId;

      return (parseInt(userId) === parseInt(id))
    },
  },
  computed: {
    isVerified: function() {
      return this.verifies.length > 0
    },
    isAdmin() {
      const user = this.$store.state.user;

      const is = user ? user.userPrivilege !== 'normal' : false;
      return Boolean(is);
    },
  }
}
</script>

<style lang="scss">
  .description {
    padding: 1rem;
    border-left: 2px solid #cccccc8c;
    margin-top: 1rem;
    background-color: rgba(204, 204, 204, 0.1);

    img, video {
      max-width: 800px;
    }
  }

  /*https://stackoverflow.com/a/38106970/875788*/
  /*.bookmark::before {*/
    /*display: block;*/
    /*content: " ";*/
    /*margin-top: -4rem;*/
    /*height: 4rem;*/
    /*visibility: hidden;*/
  /*}*/

  /*let element = document.querySelector('#user-verify-cheater-7')*/
  /*element.offsetTop - element.scrollTop + element.clientTop*/
</style>

