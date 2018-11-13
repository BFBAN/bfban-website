<template>
  <div class="container">
    <div class="content">
      <div v-if="isCheaterExist">
        <div style="display: flex; flex-direction: column;">

      <span style="font-size: 1.6rem;">
        <router-link :to="{name: 'cheaters', query: {game: `${gameName}`}}">
          <Tag>
            {{ gameName }}
          </Tag>
        </router-link>

        <span style="    color: rgb(144, 144, 144);
    font-size: 1.2rem;
    margin: 0px 0.4rem 0 0;">
          /
        </span>

        <span>
          {{ cheater.originId }}
        </span>
        <sub v-if="!idExist && `${gameName}` === 'bf1'" style="font-size: .6rem; color: #ed4014;">该id已不存在</sub>
      </span>

          <div>
            <Tag color="error">
              {{ handleStatus(cheater.status) }}
            </Tag>

            <Tag v-if="cheater.cheatMethods" color="warning">
              {{ convertCheatMethods(cheater.cheatMethods) }}
            </Tag>

            <Tag v-show="idExist" color="primary">
              battlefieldtracker
            </Tag>
            <a v-show="idExist && `${gameName}` === 'bf1'" target="_blank" :href="`https://battlefieldtracker.com/bf1/profile/pc/${cheater.originId}`">在线战绩</a>
            <a v-if="cheater.trackerShot" :href="cheater.trackerShot" target="_blank">bf1tracker数据截图</a>
            <a v-if="cheater.trackerWeaponShot" :href="cheater.trackerWeaponShot" target="_blank">bf1tracker武器截图</a>


            <Tag v-show="idExist" color="primary">
              bf1stats
            </Tag>
            <a v-show="idExist && `${gameName}` === 'bf1'" target="_blank" :href="`http://bf1stats.com/pc/${cheater.originId}`">在线战绩</a>
            <a v-if="cheater.bf1statsShot" :href="cheater.bf1statsShot" target="_blank">bf1stats数据截图</a>
          </div>

          <p>
            被围观了 {{ cheater.n || 0 }} 次
          </p>

          <img v-if="cheater.originId" class="cheater-desc" :src="`http://g.bf1stats.com/EwvWxWrq/pc/${cheater.originId}.png`"/>
        </div>

        <div style="position: relative">
          <h2 style="margin: 1rem 0;">时间线</h2>
          <TimelineItem pending v-for="l in timelineList" :key="l.createDatetime">

            <div v-if="l.type === 'report'" class="timeline-content">
              <div class="timeline-time">
                <Time :time="l.createDatetime"></Time>

                <router-link :to="{name: 'account', params: {uId: `${l.uId}`}}">
                  <Tag v-if="l.privilege === 'admin'" color="success">
                    管理员
                  </Tag>
                  <b>{{l.username}}</b>
                </router-link>
                举报
                <Tag color="warning">
                  {{convertCheatMethods(l.cheatMethods || '')}}
                </Tag>
              </div>

              <p v-if="l.bilibiliLink">
                <Tag color="primary">
                  视频链接
                </Tag>
                <a :href="l.bilibiliLink" target="_blank">{{ l.bilibiliLink }}</a>
              </p>
              <div v-if="l.description" v-html="l.description" class="description">
              </div>

              <p v-if="isLogin">
                <a href="#" :data-floor="`${l.floor}`" :data-user-id="`${l.userId}`" @click.prevent="handleReply">回复</a>
              </p>
            </div>


            <div v-if="l.type === 'verify'" class="timeline-content bookmark" :id="`user-verify-cheater-${l.id}`">
              <div class="timeline-time">
                <Time :time="l.createDatetime"></Time>
                <router-link :to="{name: 'account', params: {uId: `${l.uId}`}}">
                  <Tag v-if="l.privilege === 'admin'" color="success">
                    管理员
                  </Tag>
                  <b>{{l.username}}</b>
                </router-link>

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
              </div>

              <div v-html="l.suggestion" class="description"></div>

              <p v-show="isAdmin && cheater.status !== '1' && l.status === '1' && !isSelf(l.userId)">
                <a href="#"
                   @click.prevent.stop="doConfirm"
                   :data-user-verify-cheater-id="l.id"
                   :data-cheat-methods="l.cheatMethods"
                   :data-user-verify-cheater-username="l.username">

                  <Icon type="md-thumbs-up" />
                  赞同上处理 并 石锤
                </a>
              </p>

              <p v-if="isLogin">
                <a href="#" :data-floor="`${l.floor}`" :data-user-id="`${l.userId}`" @click.prevent="handleReply">回复</a>
              </p>
            </div>


            <div v-if="l.type === 'confirm'" class="timeline-content">
              <div class="timeline-time">
                <Time :time="l.createDatetime"></Time>

                <router-link :to="{name: 'account', params: {uId: `${l.uId}`}}">
                  <Tag v-if="l.privilege === 'admin'" color="success">
                    管理员
                  </Tag>
                  <b>{{l.username}}</b>
                </router-link>
                赞同了
                <a @click.stop.prevent="jumpToBookmark" :data-hash="`#user-verify-cheater-${l.userVerifyCheaterId}`">
                  # 该决定
                </a>
                ，作弊方式
                <Tag color="warning">
                  {{ convertCheatMethods(l.cheatMethods || '') }}
                </Tag>
              </div>

              <p v-if="isLogin">
                <a href="#" :data-floor="`${l.floor}`" :data-user-id="`${l.userId}`" @click.prevent="handleReply">回复</a>
              </p>
            </div>


            <div v-if="l.type === 'reply'" class="timeline-content">
              <div class="timeline-time">
                <Time :time="l.createDatetime"></Time>

                <router-link v-if="l.foo" :to="{name: 'account', params: {uId: `${l.fooUId}`}}">

                  <Tag v-if="l.privilege === 'admin'" color="success">
                    管理员
                  </Tag>
                  <b>{{l.foo}}</b>
                </router-link>
                回复
                <router-link v-if="l.bar" :to="{name: 'account', params: {uId: `${l.barUId}`}}">

                  <Tag v-if="l.privilege === 'admin'" color="success">
                    管理员
                  </Tag>
                  <b>{{l.bar}}</b>
                </router-link>
              </div>

              <div v-html="l.content" class="description"></div>

              <p v-if="isLogin">
                <a href="#" :data-floor="`${l.floor}`" :data-user-id="`${l.userId}`" @click.prevent="handleReply">回复</a>
              </p>
            </div>


          </TimelineItem>

          <Spin size="large" fix v-show="spinShow"></Spin>
        </div>

        <div v-if="isLogin">
          <p class="hint">任何注册用户或管理员 都可以回复 参与讨论留言</p>
          <Form :label-width="80" style="position: relative;">
            <p>
              <Input v-model="reply.content" type="textarea" :autosize="{minRows: 2}" placeholder="说点什么吧。。。" />
            </p>
            <Button type="primary" @click.stop.prevent="doReply">回复</Button>

            <Spin size="large" fix v-show="replySpinShow"></Spin>
          </Form>
        </div>

        <div v-if="cheater.status === '1'">
          <Divider />
          <p class="hint">如果你对该 石锤 有所疑问，请 复制该网址，找管理员申诉</p>

        </div>

        <div v-if="isAdmin">
          <Divider>管理员专区</Divider>
          <p class="hint">若要石锤，需要至少两位管理员参与才行</p>
          <p class="hint">不要轻易下判断，如果不能做出处理判断，就使用上方回复 参与讨论，等待举报者回复</p>
          <p class="hint">管理员的任何处理操作都会对作弊者的 现有状态 造成改变，如果不是100%确定，请使用回复留言讨论</p>

          <h2 style="margin: 1rem 0;">处理意见</h2>

          <Form :label-width="80" ref='verifyForm' style="position: relative;">
            <FormItem label="意见">
              <Select v-model="verify.status">
                <Option value="1">石锤</Option>
                <Option value="2">嫌疑再观察</Option>
                <Option value="3">没有问题不是挂</Option>
                <Option value="4">回收站</Option>
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
              <Input v-model="verify.suggestion" type="textarea" :autosize="{minRows: 2}" placeholder="必填" />
            </FormItem>

            <FormItem>
              <Button type="primary" @click.stop.prevent="doVerify">提交</Button>
            </FormItem>

            <Spin size="large" fix v-show="verifySpinShow"></Spin>
          </Form>
        </div>


        <Modal
          v-model="replyModal"
          title="回复"
          ok-text="提交"
          cancel-text="取消"
          @on-ok="doReply"
          @on-cancel="cancelReply">
          <div v-if="isLogin">
            <p class="hint">任何注册用户或管理员 都可以回复 参与讨论留言</p>
            <Form :label-width="80" ref='replyForm' style="position: relative;">
              <Input v-model="reply.content" type="textarea" :autosize="{minRows: 2}" placeholder="说点什么吧。。。" />
            </Form>
          </div>
          <div v-else>请登录后参与回复</div>
        </Modal>
      </div>
      <div v-else>404 不存在</div>

    </div>
  </div>

</template>

<script>

import { checkIdExist, getCheaterStatusLabel, formatTextarea } from "./common";

export default {
  data() {
    return {
      cheater: {
        originId: '',
      },
      timelineList: [],
      verify: {
        status: '1',
        checkbox: [],
        suggestion: '',
      },
      spinShow: true,
      idExist: true,

      verifySpinShow: false,

      reply: {
        cheaterId: '',
        userId: '',
        content: '',
        toFloor: '',
        toUserId: '',
      },
      replySpinShow: false,

      cheaterUId: '',
      gameName: '',

      isCheaterExist: true,

      replyModal: false,
    }
  },
  watch: {
    '$route': 'loadData',
  },
  created() {
    this.loadData();
  },
  methods: {
    loadData() {
      const gameName = this.gameName = this.$route.params.game;
      const cheaterUID = this.cheaterUId = this.$route.params.uid;

      axios({
        method: 'get',
        url: `/cheaters/${gameName}/${cheaterUID}`,
      })
      .then((res) => {
        this.spinShow = false;

        const d = res.data;
        let { cheater, reports, verifies, confirms, replies } = d.data;

        if (cheater.length === 0) {
          this.isCheaterExist = false;
          return false;
        }

        this.cheater = cheater[0];


        reports = _.each(reports, (v, k, l) => {
          v['type'] = 'report'
        });
        verifies = _.each(verifies, (v, k, l) => {
          v['type'] = 'verify'
        });
        confirms = _.each(confirms, (v, k, l) => {
          v['type'] = 'confirm'
        });
        replies = _.each(replies, (v, k, l) => {
          v['type'] = 'reply'
        });

        let timelineList = reports.concat(verifies, confirms, replies);

        timelineList = _.sortBy(timelineList, (v) => {
          return (new Date(v.createDatetime)).getTime();
        });

        timelineList = _.each(timelineList, (v, k) => {
          v['floor'] = k + 1;
        });

        // render timeline
        this.timelineList = timelineList;

        // check id exist
        checkIdExist({
          gameName: this.gameName,
          id: this.cheater.originId,
        })
        .then((res) => {
          let d = res.data;

          this.idExist = d.idExist;
        });
      });
    },
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
    handleStatus: getCheaterStatusLabel,
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
      this.verifySpinShow = true;

      const {status} = this.verify;
      let { suggestion } = this.verify;
      const cheaterUId = this.$route.params.uid;
      const cheatMethods = this.verify.checkbox.join(',');

      if (cheatMethods === ',' || suggestion.trim() === '') {
        this.$Message.warning('请填写完整');
      }

      suggestion = formatTextarea(suggestion);

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
        this.verifySpinShow = false;

        const d = res.data;
        if (res.data.error === 0) {
          // reset verifyForm
          this.verify.status = '0';
          this.verify.suggestion = '';
          this.verify.checkbox = [];

          const { id, userId, createDatetime, status, suggestion, username, cheatMethods, privilege } = d.data;

          this.cheater.status = status;

          this.timelineList.push({
            type: 'verify',
            id,
            userId,
            createDatetime,
            // fix bug
            status: status === '6' ? '1' : status,
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
    handleReply(e) {
      const { floor, userId } = e.target.dataset;

      this.reply.toFloor = floor === 'undefined' ?  '' : floor;
      this.reply.toUserId = userId === 'undefined' ? '' : userId;

      // open reply modal
      this.replyModal = true;
    },
    cancelReply() {
      this.reply = {};
    },
    doReply() {
      this.replySpinShow = true;

      const gameName = this.$route.params.game;
      const cheaterId = this.cheater.id;
      const userId = this.$store.state.user.userId;
      const { toFloor, toUserId } = this.reply;
      let {content} = this.reply;

      content = formatTextarea(content);

      let data = {
        gameName,
        cheaterId,
        userId,
        content,
      };

      if (toFloor) {
        data['toFloor'] = toFloor;
      }
      if (toUserId) {
        data['toUserId'] = toUserId;
      }

      axios({
        method: 'post',
        url: '/cheaters/reply',
        data,
      })
      .then((res) => {
        this.replySpinShow = false;

        const d = res.data;

        if (d.error === 0) {
          const { createDatetime, content, status } = d.data;
          this.$Message.success('回复成功');

          // reset reply
          this.cancelReply();

          const foo = this.$store.state.user.username;
          const fooUId = this.$store.state.user.uId;
          const bar = '';
          const barUId = '';
          this.timelineList.push({
            type: 'reply',

            createDatetime,
            content,
            foo,
            fooUId,
            bar,
            barUId,
          });
          this.cheater.status = status;
        } else {
          this.$Message.error('回复失败');
        }
      });
    }
  },
  computed: {
    isVerified() {
      return this.verifies.length > 0
    },
    isAdmin() {
      const user = this.$store.state.user;

      const is = user ? user.userPrivilege !== 'normal' : false;
      return Boolean(is);
    },
    isLogin() {
      return Boolean(this.$store.state.user);
    }
  }
}
</script>

<style lang="scss">
  .cheater-desc {
    max-width: 100%;
    width: 34rem;
  }
  .description {
    padding: .6rem;
    color: rgba(0, 0, 0, 0.8);
    border-left: 1px solid #cccccc8f;
    font-size: .8rem;

    img, video {
      max-width: 100%;
    }
  }

  .timeline-time {
    color: #00000073;
  }
  .ivu-time {
    margin-right: .6rem;
  }
  .timeline-content {
    position: relative;
    top: -.3rem;
  }
  .ivu-timeline-item-content {
    padding: 0 0 0 1.2rem;

    &:hover {
      background-color: #eaeaea66;
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

