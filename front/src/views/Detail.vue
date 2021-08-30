<template>
  <div class="container">
    <div class="content">
      <div v-if="isCheaterExist" style="position: relative">

        <Row :gutter="20">
          <Col span="18" push="6">
            <div>
              <h1 style="font-size: 1.6rem;">
                {{ cheater.originId || 'user id' }}

                <!-- 被举报的游戏 -->
                <Tag color="gold" :alt="$t('detail.info.reportedGames', { msg: 'reportedGames' })">
                  <router-link v-for="g in games" :key="g.game" :to="{name: 'cheaters'}" >
                    {{ g.game || 'game name' }}
                  </router-link>
                </Tag>

                <Tag color="error">
                  {{ handleStatus(cheater.status) || 'static load' }}
                </Tag>

                <Tag v-if="cheater.cheatMethods" color="warning">
                  {{ convertCheatMethods(cheater.cheatMethods) }}
                </Tag>
              </h1>

              <Dropdown>
                <a href="javascript:void(0)">
                  {{ $t('detail.info.historyID', { msg: 'historyID' })}}
                  <Icon type="ios-arrow-down"></Icon>
                </a>
                <DropdownMenu slot="list" v-show="origins.length">
                  <!-- 历史ID -->
                  <DropdownItem v-for="origin in origins" :key="origin.id">
                    <Time :time="origin.createDatetime"></Time> | {{ origin.cheaterGameName }}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Poptip
                @on-ok="updateCheaterInfo">
                <div style="margin-top: .4rem;" slot="content">
                  <p class="hint">
                    <!-- 描述说明 -->
                    {{ $t('detail.info.discription1', { msg: 'discription1' })}}
                    <Button @click.prevent="updateCheaterInfo"><span>{{ $t('detail.info.updateButton', { msg: 'updateButton' })}}</span></Button>，
                    <span>{{ $t('detail.info.discription2', { msg: 'discription2' })}}</span>
                  </p>
                  <p class="hint">
                    {{ $t('detail.info.discription3', { msg: 'discription3' })}}
                  </p>
                  <p class="hint">
                    {{ $t('detail.info.discription4', { msg: 'discription4' })}}
                  </p>
                </div>
                <a>{{ $t('detail.info.updateButton', { msg: 'updateButton' }) }}</a>
              </Poptip>
            </div>

            <br>

            <Row :gutter="10">
              <Col span="6">
                <Card>
                  <!-- 浏览次数 -->
                  <h3>{{ cheater.n || 0 }}</h3>
                  <span>{{ $t('detail.info.viewTimes', { msg: 'viewTimes' })}}</span>
                </Card>
              </Col>
              <Col span="6">
                <Card>
                  <!-- 回复次数 -->
                  <h3>{{ cheater.commentsNum || 0 }}</h3>
                  <span>{{ $t('detail.info.reply', { msg: 'reply' })}}</span>
                </Card>
              </Col>
              <Col span="6">
                <Card>
                  <!-- 第一次被举报时间 -->
                  <h3><Time v-if="cheater.createDatetime" :time="cheater.createDatetime"></Time></h3>
                  <span>{{ $t('detail.info.firstReportTime', { msg: 'firstReportTime' })}}</span>
                </Card>
              </Col>
              <Col span="6">
                <Card>
                  <!-- 最近更新时间 -->
                  <h3><Time v-if="cheater.updateDatetime" :time="cheater.updateDatetime"></Time></h3>
                  <span>{{ $t('detail.info.recentUpdateTime', { msg: 'recentUpdateTime' })}}</span>
                </Card>
              </Col>
            </Row>

            <div v-show="cheater.originId" style="margin-top: .4rem;">
              <!-- 战绩链接 -->
              <h2>
                <span>{{ $t('detail.info.gameScores', { msg: 'gameScores' })}}</span>
              </h2>
              <p v-for="g in games" :key="g.game">
                <Tag>
                  {{g.game}}
                </Tag>
                <a v-show="`${g.game}` === 'bf1'" target="_blank" :href="`https://battlefieldtracker.com/bf1/profile/pc/${cheater.originId}`">
                  battlefieldtracker
                </a>
                <Divider type="vertical"  v-show="`${g.game}` === 'bf1'" />
                <a v-show="`${g.game}` === 'bf1'" target="_blank" :href="`http://bf1stats.com/pc/${cheater.originId}`">
                  bf1stats
                </a>
                <Divider type="vertical"  v-show="`${g.game}` === 'bfv'" />
                <a v-show="`${g.game}` === 'bfv'" target="_blank" :href="`https://battlefieldtracker.com/bfv/profile/origin/${cheater.originId}`">
                  battlefieldtracker
                </a>
                <Divider type="vertical" />
                <a target="_blank" :href="`https://www.247fairplay.com/CheatDetector/${cheater.originId}`">
                  247fairplay
                </a>
              </p>

              <div>
                <a v-if="cheater.trackerShot" :href="cheater.trackerShot" target="_blank">bf1tracker数据截图</a>
                <a v-if="cheater.trackerWeaponShot" :href="cheater.trackerWeaponShot" target="_blank">bf1tracker武器截图</a>
                <a v-if="cheater.bf1statsShot" :href="cheater.bf1statsShot" target="_blank">bf1stats数据截图</a>
              </div>
            </div>

          </Col>
          <Col span="6" pull="18">
            <div v-show="cheater.avatarLink">
              <!-- Origin头像 -->
              <h1>
                <span>{{ $t('detail.info.originAvatar', { msg: 'originAvatar' })}}</span>
              </h1>
              <img :src="cheater.avatarLink" alt="avatar" width="150" height="150">
            </div>
          </Col>
        </Row>

        <Divider dashed />

        <Row :gutter="20">
          <Col span="18" push="6">
            <div>
              <!-- 时间线 -->
              <h2 style="margin: 1rem 0;"><Icon type="md-time" />  {{ $t('detail.info.timeLine', { msg: 'timeLine' })}}</h2>
              <TimelineItem pending :color="l.privilege === 'admin' ? 'red' : 'green'" v-for="l in timelineList" :key="l.createDatetime">

                <div v-if="l.type === 'report'" class="timeline-content">
                  <div class="timeline-time">
                    <Time :time="l.createDatetime"></Time>

                    <router-link :to="{name: 'account', params: {uId: `${l.uId}`}}">
                      <!-- 管理员 -->
                      <Tag v-if="l.privilege === 'admin'" color="success">
                        {{ $t('detail.info.administrator', { msg: 'administrator' })}}
                      </Tag>
                      <b>{{l.username}}</b>
                    </router-link>
                    <!-- 举报 -->
                    {{ $t('detail.info.report', { msg: 'report' })}}

                    <router-link :to="{name: 'cheater', ouid: `${l.originUserId}`}">
                      {{ l.cheaterGameName }}
                    </router-link>

                    <!-- 在 -->
                    {{ $t('detail.info.inGame', { msg: 'inGame' })}}

                    <router-link :to="{name: 'cheaters', query: {game: `${l.game}`} }">
                      {{l.game}}
                    </router-link>

                    <!-- 游戏中 -->
                    {{ $t('detail.info.gaming', { msg: 'gaming' })}}

                    <b>
                      {{convertCheatMethods(l.cheatMethods || '')}}
                    </b>
                  </div>

                  <p v-if="l.bilibiliLink">
                    <!-- 游戏中 -->
                    <Tag color="primary">
                      {{ $t('detail.info.videoLink', { msg: 'videoLink' })}}
                    </Tag>
                    <a :href="l.bilibiliLink" target="_blank">{{ l.bilibiliLink }}</a>
                  </p>
                  <div v-if="l.description" v-html="l.description" class="description">
                  </div>

                  <p v-if="isLogin">
                    <a href="#" :data-floor="`${l.floor}`" :data-user-id="`${l.userId}`" @click.prevent="handleReply">{{ $t('detail.info.reply', { msg: 'reply' })}}</a>
                  </p>
                </div>

                <div v-if="l.type === 'verify'" class="timeline-content bookmark" :id="`user-verify-cheater-${l.id}`">
                  <div class="timeline-time">
                    <Time v-if="l.createDatetime" :time="l.createDatetime"></Time>
                    <router-link :to="{name: 'account', params: {uId: `${l.uId}`}}">

                      <Tag v-if="l.privilege === 'admin'" color="success">
                        {{ $t('detail.info.administrator', { msg: 'administrator' })}}
                      </Tag>
                      <b>{{l.username}}</b>
                    </router-link>
                    <!-- 认为 -->
                    {{ $t('detail.info.judge', { msg: 'judge' })}}

                    <Tag color="warning">
                      {{ handleStatus(l.status) }}
                    </Tag>

                    <span v-if="l.cheatMethods">
              ，
              {{ $t('detail.info.cheatMethod', { msg: 'cheatMethod' })}}

              <b>
                {{convertCheatMethods(l.cheatMethods || '')}}
              </b>
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
                      <!-- 同意实锤 -->
                      {{ $t('detail.info.agreeJudgement', { msg: 'agreeJudgement' })}}
                    </a>
                  </p>

                  <p v-if="isLogin">
                    <a href="#" :data-floor="`${l.floor}`" :data-user-id="`${l.userId}`" @click.prevent="handleReply">{{ $t('detail.info.reply', { msg: 'reply' })}}</a>
                  </p>
                </div>

                <div v-if="l.type === 'confirm'" class="timeline-content">
                  <div class="timeline-time">
                    <Time v-if="l.createDatetime" :time="l.createDatetime"></Time>

                    <router-link :to="{name: 'account', params: {uId: `${l.uId}`}}">
                      <Tag v-if="l.privilege === 'admin'" color="success">
                        {{ $t('detail.info.administrator', { msg: 'administrator' })}}
                      </Tag>
                      <b>{{l.username}}</b>
                    </router-link>
                    <!-- 同意某人某条实锤 -->
                    {{ $t('detail.info.agreeWith', { msg: 'agreeWith' })}}
                    <a @click.stop.prevent="jumpToBookmark" :data-hash="`#user-verify-cheater-${l.userVerifyCheaterId}`">
                      # {{ $t('detail.info.thisChoice', { msg: 'thisChoice' })}}
                    </a>
                    <!--作弊方式 -->
                    ，{{ $t('detail.info.cheatMethod', { msg: 'cheatMethod' })}}

                    <b>
                      {{ convertCheatMethods(l.cheatMethods || '') }}
                    </b>
                  </div>

                  <p v-if="isLogin">
                    <a href="#" :data-floor="`${l.floor}`" :data-user-id="`${l.userId}`" @click.prevent="handleReply">{{ $t('detail.info.reply', { msg: 'reply' })}}</a>
                  </p>
                </div>

                <div v-if="l.type === 'reply'" class="timeline-content">
                  <div class="timeline-time">
                    <Time v-if="l.createDatetime" :time="l.createDatetime"></Time>

                    <router-link v-if="l.foo" :to="{name: 'account', params: {uId: `${l.fooUId}`}}">

                      <Tag v-if="l.fooPrivilege === 'admin'" color="success">
                        {{ $t('detail.info.administrator', { msg: 'administrator' })}}
                      </Tag>
                      <b>{{l.foo}}</b>
                    </router-link>
                    {{ $t('detail.info.reply', { msg: 'reply' })}}
                    <router-link v-if="l.bar" :to="{name: 'account', params: {uId: `${l.barUId}`}}">

                      <Tag v-if="l.barPrivilege === 'admin'" color="success">
                        {{ $t('detail.info.administrator', { msg: 'administrator' })}}
                      </Tag>
                      <b>{{l.bar}}</b>
                    </router-link>
                  </div>

                  <div v-html="l.content" class="description"></div>

                  <p v-if="isLogin">
                    <a href="#" :data-floor="`${l.floor}`" :data-user-id="`${l.userId}`" @click.prevent="handleReply">{{ $t('detail.info.reply', { msg: 'reply' })}}</a>
                  </p>
                </div>

              </TimelineItem>
              <Page :page-size="limit" show-total :current="page" @on-change="handlePageChange" :total="total" class="page" size="small" />
            </div>
          </Col>
          <Col span="6" pull="18">
            <Affix :offset-top="50">
              <div style="display: flex; flex-direction: column; position: relative;">
                <div style="margin-top: .4rem;">
                  <!-- 管理员处理历史 -->
                  <h2 style="margin: 1rem 0;"><Icon type="md-bookmark" />{{ $t('detail.info.dealRecord', { msg: 'dealRecord' })}}</h2>

                  <table>
                    <thead>
                    <tr>
                      <td><b>Operating Time</b></td>
                      <td><b>Action</b></td>
                    </tr>
                    </thead>
                    <tbody>
                    </tbody>
                  </table>
                </div>
                <Spin size="large" fix v-show="updateUserInfospinShow"></Spin>
              </div>
            </Affix>

          </Col>
        </Row>

        <div v-if="isLogin">
		      <!-- 回复操作说明 -->
          <p class="hint"><span>{{ $t('detail.info.replyManual1', { msg: 'replyManual1' })}}</span><a href="https://sm.ms/" target="_blank"><span>{{ $t('detail.info.uploadPicButton', { msg: 'uploadPicButton' })}}</span> </a>，<span>{{ $t('detail.info.replyManual2', { msg: 'replyManual2' })}}</span></p>
          <Form :label-width="80" style="position: relative;">
            <p>
              <Input @on-keydown="handleCmdEnter($event, 'reply')" v-model="reply.content" type="textarea" :autosize="{minRows: 2}" placeholder="What's your opinion?" />
            </p>
            <Button type="primary" @click.stop.prevent="doReply">{{ $t('detail.info.reply', { msg: 'reply' })}}</Button>

            <Spin size="large" fix v-show="replySpinShow"></Spin>
          </Form>
        </div>

        <div v-if="cheater.status === '1'">
          <Divider />
        </div>

        <br>

        <Alert type="warning" show-icon>
          <template slot="desc">
            {{ $t('detail.info.replyManual3', { msg: 'replyManual3' })}}
          </template>
        </Alert>

        <!-- 管理员 -->
        <div v-if="isAdmin">
          <Divider>{{ $t('detail.info.adminConsole', { msg: 'adminConsole' })}}</Divider>
          <p class="hint">{{ $t('detail.info.adminManual1', { msg: 'adminManual1' })}}</p>
          <p class="hint">{{ $t('detail.info.adminManual2', { msg: 'adminManual2' })}}</p>

          <h2 style="margin: 1rem 0;">{{ $t('detail.info.judgement', { msg: 'judgement' })}}</h2>

          <Form :label-width="80" ref='verifyForm' style="position: relative;">
            <FormItem label="Opinion">
              <Select v-model="verify.status">
			          <!-- 判断选项 -->
                <Option value="1">{{ $t('detail.info.choice1', { msg: 'choice1' })}}</Option>
                <Option value="2">{{ $t('detail.info.choice2', { msg: 'choice2' })}}</Option>
                <Option value="3">{{ $t('detail.info.choice3', { msg: 'choice3' })}}</Option>
                <Option value="4">{{ $t('detail.info.choice4', { msg: 'choice4' })}}</Option>
              </Select>
            </FormItem>

            <FormItem v-show="verify.status === '1'" label="CheatMethod">
              <CheckboxGroup v-model="verify.checkbox">
                <Checkbox v-for="method in cheatMethodsGlossary" :key="method.value" :label="method.value">
                  {{$t(`cheatMethods.${method.value}`)}}
                </Checkbox>
              </CheckboxGroup>
            </FormItem>

            <FormItem label="Reason">
              <Input @on-keydown="handleCmdEnter($event, 'verify')" v-model="verify.suggestion" type="textarea" :autosize="{minRows: 2}" placeholder="Write something" />
            </FormItem>

            <FormItem>
              <Button type="primary" @click.stop.prevent="doVerify">{{ $t('detail.info.commit', { msg: 'commit' })}}</Button>
            </FormItem>

            <Spin size="large" fix v-show="verifySpinShow"></Spin>
          </Form>
        </div>

       <!-- 小回复窗口 -->
        <Modal
          v-model="replyModal"
          title="Reply"
          ok-text="Send"
          cancel-text="Cancel"
          @on-ok="doReply"
          @on-cancel="cancelReply">
          <div v-if="isLogin">
            <Form :label-width="80" ref='replyForm' style="position: relative;">
              <Input @on-keydown="handleCmdEnter($event, 'reply')" v-model="reply.content" type="textarea" :autosize="{minRows: 2}" placeholder="Say something" />
            </Form>
          </div>
          <div v-else>{{ $t('detail.info.replyManual4', { msg: 'replyManual4' })}}</div>
        </Modal>

        <Spin size="large" fix v-show="spinShow"></Spin>
      </div>
      <div v-else>404 不存在</div>

    </div>
  </div>

</template>

<script>
import ajax from '@/mixins/ajax';
import {
  checkIdExist,
  getCheaterStatusLabel,
  formatTextarea,
  convertDatetimeToUserTimeZone,
  cheatMethodsGlossary,
  convertCheatMethods,
  waitForAction,
  replaceImgSrcToDataSrc
} from "@/mixins/common";

export default {
  data() {
    return {
      cheater: {
        originId: '',
      },
      origins: [],
      games: [],
      timelineList: [],
      verify: {
        status: '1',
        checkbox: [],
        suggestion: '',
      },
      spinShow: true,
      idExist: false,

      verifySpinShow: false,

      reply: {
        cheaterId: '',
        userId: '',
        content: '',
        toFloor: '',
        toUserId: '',
      },
      replySpinShow: false,

      gameName: '',

      isCheaterExist: true,

      replyModal: false,

      cheatMethodsGlossary,

      updateUserInfospinShow: false,
    }
  },
  watch: {
    '$route': 'loadData',
  },
  created() {
    this.loadData();
  },
  updated() {
    new LazyLoad({})
  },
  methods: {
    loadData() {
      const originUserId = this.$route.params.ouid;

      ajax({
        method: 'get',
        url: `/cheaters/${originUserId}`,
      })
      .then((res) => {
        this.spinShow = false;

        const d = res.data;
        let { cheater, games, origins, reports, verifies, confirms, replies } = d.data;

        if (cheater.length === 0) {
          this.isCheaterExist = false;
          return false;
        } else {
          this.isCheaterExist = true;
        }

        this.cheater = cheater[0];
        this.origins = _.sortBy(origins, 'createDatetime').reverse();
        this.games = _.sortBy(games, 'game');


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

        // img src => data-src
        reports = _.each(reports, (v) => {
          v['description'] = replaceImgSrcToDataSrc(v['description']);
        });
        replies = _.each(replies, (v, k, l) => {
          v['content'] = replaceImgSrcToDataSrc(v['content']);
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
    convertCheatMethods,
    async doVerify() {
      const {status} = this.verify;
      let { suggestion } = this.verify;
      const cheatMethods = this.verify.checkbox.join(',');
      const { originUserId } = this.cheater;

      if ( (status === '1' && cheatMethods === '') || suggestion.trim() === '') {
        this.$Message.warning('请填写完整');
        return false;
      }

      // JUST before ajax
      this.verifySpinShow = true;
      const {data: statusData} = await ajax({
        method: 'post',
        url: '/cheaters/status',
        data: {
          originUserId,
        }
      });
      if (statusData.error) {
        this.$Message.error(statusData.msg);
        return false;
      }
      if (statusData.error === 0 && statusData.status === '1') {
        if (!confirm(`当前是 confirmed hacker 状态，你确定要处理成 ${getCheaterStatusLabel(status)} 吗？`)) {
          this.verifySpinShow = false;
          return false;
        }
      }

      suggestion = formatTextarea(suggestion);


      ajax({
        method: 'post',
        url: '/cheaters/verify',
        data: {
          status,
          suggestion,
          cheatMethods,
          originUserId,
        }
      })
      .then((res) => {
        this.verifySpinShow = false;

        const d = res.data;
        if (res.data.error === 0) {
          // reset verifyForm
          this.verify.status = '1';
          this.verify.suggestion = '';
          this.verify.checkbox = [];

          const { id, userId, createDatetime, status, suggestion, username, cheatMethods, privilege } = d.data;

          this.cheater.status = status;

          this.timelineList.push({
            type: 'verify',
            id,
            userId,
            createDatetime: convertDatetimeToUserTimeZone(createDatetime),
            // fix bug
            status: status === '6' ? '1' : status,
            suggestion,
            cheatMethods,
            username,
            privilege,
          });

          this.$Message.success('提交成功');
        } else {
          this.$Message.error('failed ' + d.msg);
        }
      })
    },
    doConfirm(e) {
      const { userVerifyCheaterId, userVerifyCheaterUsername, cheatMethods } = e.target.dataset;
      const { userId } = this.$store.state.user;
      const originUserId = this.$route.params.ouid;

      ajax({
        method: 'post',
        url: '/cheaters/confirm',
        data: {
          userVerifyCheaterId,
          userId,
          originUserId,
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
            createDatetime: convertDatetimeToUserTimeZone(createDatetime),
            cheatMethods,
            username: this.$store.state.user.username,
          })
        } else {
          this.$Message.warning(d.msg);
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

      const cheaterId = this.cheater.id;
      const userId = this.$store.state.user.userId;
      const { toFloor, toUserId } = this.reply;
      const { originUserId } = this.cheater;
      let {content = ''} = this.reply;

      content = formatTextarea(content);

      let data = {
        cheaterId,
        userId,
        content,
        originUserId,
      };

      if (toFloor) {
        data['toFloor'] = toFloor;
      }
      if (toUserId) {
        data['toUserId'] = toUserId;
      }

      ajax({
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

            createDatetime: convertDatetimeToUserTimeZone(createDatetime),
            content,
            foo,
            fooUId,
            bar,
            barUId,
          });
          this.cheater.status = status;
        } else {
          this.$Message.error(d.msg);
        }
      });
    },
    handleCmdEnter(e, type) {
      if ( (e.metaKey || e.ctrlKey) && e.keyCode == 13 )  {
        switch(type) {
          case 'reply':
            this.doReply()
            break;
          case 'verify':
            this.doVerify();
            break;
        }
      }
    },
    updateCheaterInfo(e) {
      waitForAction.call(e.target, 60);

      if (!Boolean(this.$store.state.user)) {
        this.$Message.error('请登录');
        return false;
      }

      this.updateUserInfospinShow = true;
      const { originUserId } = this.cheater;
      ajax({
        method: 'post',
        url: '/cheaters/updateCheaterInfo',
        data: {
          originUserId,
        }
      }).then((res) => {
        this.updateUserInfospinShow = false;

        const d = res.data;
        if (d.error === 0) {
          const {cheaterGameName: originId, originUserId, avatarLink} = d.data.origin;

          this.cheater.originId = originId;
          this.cheater.originUserId = originUserId;
          this.cheater.avatarLink = avatarLink;

          this.origins.unshift(d.data.origin);

          this.$Message.success('更新完成');
        } else {
          this.$Message.error(d.msg);
        }
      });
    },
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
    color: rgba(0, 0, 0, 0.8);
    font-size: .8rem;
    line-height: 1.4rem;

    img, video {
      border: 1px solid #f2f2f2;
      max-width: 100%;
      max-height: 200px;
      margin-right: 10px;
      margin-bottom: 10px;
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

    // force to wrap
    overflow-wrap: break-word;
    word-wrap: break-word;
  }
  .ivu-timeline-item {
    padding: 1rem 0;
  }
  .ivu-timeline-item-content {
    padding: 0 .6rem 0 1.2rem;
  }
  .ivu-timeline-item-tail {
    top: 1rem;
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

