<template>
  <div class="container">
    <div class="content">
      <br>
      <Breadcrumb>
        <BreadcrumbItem to="/">{{ $t("header.index") }}</BreadcrumbItem>
        <BreadcrumbItem to="/cheaters">{{ $t("list.title") }}</BreadcrumbItem>
        <BreadcrumbItem>{{ $t("detail.info.cheatersInfo") }}</BreadcrumbItem>
      </Breadcrumb>
      <br>
      <Card v-if="isCheaterExist" dis-hover>
        <Row :gutter="20">
          <Col :xs="{span: 22}" :lg="{span: 4}">
            <div v-show="cheater.avatarLink" align="center">
              <!-- Origin头像 -->
              <Avatar shape="square" :src="cheater.avatarLink" size="150"
                      :title="$t('detail.info.originAvatar', { msg: 'originAvatar' })"/>
            </div>
          </Col>
          <Col :xs="{span: 22, pull: 1, push: 1}" :lg="{span: 18, push: 2}">
            <div>
              <Row>
                <Col :xs="{span: 24}" :lg="{span: 20}">
                  <h1 style="font-size: 1.6rem;">
                    {{ cheater.originName || 'user id' }}

                    <!-- 被举报的游戏 -->
                    <Tag color="gold" :alt="$t('detail.info.reportedGames', { msg: 'reportedGames' })">
                      <router-link :to="{name: 'cheaters'}">
                        {{ cheater.games }}
                      </router-link>
                    </Tag>

                    <Tag color="error">
                      {{ $t(`basic.status[${cheater.status}]`) }}
                    </Tag>

                    <Tag v-if="cheater.cheatMethods" color="warning">
                      {{ convertCheatMethods(cheater.cheatMethods) }}
                    </Tag>
                  </h1>
                  <span>id:  {{ cheater.originUserId || 'id' }}</span>
                  <Divider type="vertical"/>
                  <Dropdown>
                    <a href="javascript:void(0)">
                      {{ $t('detail.info.historyID', {msg: 'historyID'}) }}
                      <Icon type="ios-arrow-down"></Icon>
                    </a>
                    <DropdownMenu slot="list" v-if="cheater && cheater.history && cheater.history.length >= 0">
                      <!-- 历史ID -->
                      <DropdownItem v-for="origin in cheater.history" :key="origin.originName">
                        <Time :time="origin.fromTime"></Time>
                        <Divider type="vertical"/>
                        {{ origin.originName }}
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                  <Divider type="vertical"/>
                  <Poptip
                      @on-ok="updateCheaterInfo">
                    <div style="margin-top: .4rem;" slot="content">
                      <p class="hint">
                        <!-- 描述说明 -->
                        {{ $t('detail.info.discription1', {msg: 'discription1'}) }}
                        <Button @click.prevent="updateCheaterInfo">
                          <span>{{ $t('detail.info.updateButton', {msg: 'updateButton'}) }}</span>
                        </Button>
                        ，
                        <span>{{ $t('detail.info.discription2', {msg: 'discription2'}) }}</span>
                      </p>
                      <p class="hint">
                        {{ $t('detail.info.discription3', {msg: 'discription3'}) }}
                      </p>
                      <p class="hint">
                        {{ $t('detail.info.discription4', {msg: 'discription4'}) }}
                      </p>
                    </div>
                    <a>{{ $t('detail.info.updateButton', {msg: 'updateButton'}) }}</a>
                  </Poptip>
                </Col>
                <Col :xs="{span: 24}" :lg="{span: 4}" align="right">
                  <Poptip content="content" placement="right-end" title="">
                    <Icon type="md-qr-scanner" size="20" color="#535353"/>
                    {{ $t('detail.info.app_qr.title') }}

                    <div slot="content" class="mobile-hide">
                      <vue-qr :text="'{id: '+ $route.params.ouid + '}'" :size="200"></vue-qr>

                      <div class="qrcode" ref="qrCodeUrl"></div>

                      {{ $t('detail.info.app_qr.tip') }}
                    </div>
                    <div slot="content" class="desktop-hide" align="center">
                      <Button>{{ $t('detail.info.app_qr.openApp') }}</Button>
                      <p>{{ $t('detail.info.app_qr.openAppDescribe') }}</p>
                    </div>
                  </Poptip>
                </Col>
              </Row>
            </div>

            <br>

            <Row :gutter="10">
              <Col :xs="{span: 12}" :lg="{span: 6}">
                <Card>
                  <!-- 浏览次数 -->
                  <h3>{{ cheater.viewNum || 0 }}</h3>
                  <span>{{ $t('detail.info.viewTimes', {msg: 'viewTimes'}) }}</span>
                </Card>
              </Col>
              <Col :xs="{span: 12}" :lg="{span: 6}">
                <Card>
                  <!-- 回复次数 -->
                  <h3>{{ cheater.commentsNum || 0 }}</h3>
                  <span>{{ $t('detail.info.reply', {msg: 'reply'}) }}</span>
                </Card>
              </Col>
              <Col :xs="{span: 12}" :lg="{span: 6}">
                <Card>
                  <!-- 第一次被举报时间 -->
                  <h3>
                    <Time v-if="cheater.createTime" :time="cheater.createTime"></Time>
                  </h3>
                  <span>{{ $t('detail.info.firstReportTime', {msg: 'firstReportTime'}) }}</span>
                </Card>
              </Col>
              <Col :xs="{span: 12}" :lg="{span: 6}">
                <Card>
                  <!-- 最近更新时间 -->
                  <h3>
                    <Time v-if="cheater.updateTime" :time="cheater.updateTime"></Time>
                  </h3>
                  <span>{{ $t('detail.info.recentUpdateTime', {msg: 'recentUpdateTime'}) }}</span>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
      <br>
      <Card style="overflow: hidden" dis-hover>
        <Row :gutter="20" type="flex">
          <Col :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 18, push: 1}" order="2" class="tabs-style">
            <Tabs type="card">
              <TabPane :label="$t('detail.info.timeLine', { msg: 'timeLine' })">
                <div>
                  <!-- 时间线 -->
                  <TimelineItem
                      :id="`floor-${index}`"
                      pending
                      :color="l.privilege === 'admin' ? 'red' : 'green'" v-for="(l, index) in timelineList"
                      :key="l.createTime">
                    <!-- 举报 S -->
                    <div v-if="l.type === 'report'" class="timeline-content">
                      <div class="timeline-time">
                        <Time :time="l.createTime"></Time>

                        <router-link :to="{name: 'account', params: {uId: `${l.uId}`}}">
                          <!-- 管理员 -->
                          <Tag v-if="l.privilege === 'admin'" color="success">
                            {{ $t('detail.info.administrator', {msg: 'administrator'}) }}
                          </Tag>
                          <b>{{ l.username }}</b>
                        </router-link>
                        <!-- 举报 -->
                        {{ $t('detail.info.report', {msg: 'report'}) }}

                        <router-link :to="{name: 'cheater', ouid: `${l.originUserId}`}">
                          {{ l.cheaterGameName }}
                        </router-link>

                        <!-- 在 -->
                        {{ $t('detail.info.inGame', {msg: 'inGame'}) }}

                        <router-link :to="{name: 'cheaters', query: {game: `${l.game}`} }">
                          {{ l.game }}
                        </router-link>

                        <!-- 游戏中 -->
                        {{ $t('detail.info.gaming', {msg: 'gaming'}) }}

                        <b>
                          {{ convertCheatMethods(l.cheatMethods || '', $root.$i18n.locale) }}
                        </b>
                      </div>

                      <p v-if="l.bilibiliLink">
                        <!-- 游戏中 -->
                        <Tag color="primary">
                          {{ $t('detail.info.videoLink', {msg: 'videoLink'}) }}
                        </Tag>
                        <a :href="l.bilibiliLink" target="_blank">{{ l.bilibiliLink }}</a>
                      </p>
                      <div v-if="l.description" v-html="l.description" class="description">
                      </div>

                      <p v-if="isLogin">
                        <!-- 回复 -->
                        <Button type="dashed"
                                @click="handleReply(l.floor || index, l.byUserId)">
                          {{ $t('detail.info.reply', {msg: 'reply'}) }}
                        </Button>
                      </p>
                    </div>
                    <!-- 举报 E -->

                    <!-- 认为 S -->
                    <div v-if="l.type === 'verify' || l.type === 'judgement'" class="timeline-content bookmark"
                         :id="`user-verify-cheater-${l.id}`">
                      <div class="timeline-time">
                        <Time v-if="l.createTime" :time="l.createTime"></Time>
                        <router-link :to="{name: 'account', params: {uId: `${l.byUserId}`}}">
                          <Tag v-if="l.privilege === 'admin'" color="success">
                            {{ $t('detail.info.administrator', {msg: 'administrator'}) }}
                          </Tag>
                          <b>{{ l.username }}</b>
                        </router-link>
                        {{ $t('detail.info.judge', {msg: 'judge'}) }}

                        <Tag color="warning">
                          {{ getCheaterStatusLabel(l.action) }}
                        </Tag>

                        <span v-if="l.cheatMethods">
                          ，{{ $t('detail.info.cheatMethod', {msg: 'cheatMethod'}) }}
                          <b>{{ convertCheatMethods(l.cheatMethods || '', $root.$i18n.locale) }}</b>
                        </span>
                      </div>

                      <div v-html="l.content" v-if="l.content" class="description"></div>

                      <p v-show="isAdmin && cheater.status !== '1' && l.status === '1' && !isSelf(l.userId)">
                        <a href="#"
                           @click.prevent.stop="doConfirm"
                           :data-user-verify-cheater-id="l.id"
                           :data-cheat-methods="l.cheatMethods"
                           :data-user-verify-cheater-username="l.username">

                          <Icon type="md-thumbs-up"/>
                          <!-- 同意实锤 -->
                          {{ $t('detail.info.agreeJudgement', {msg: 'agreeJudgement'}) }}
                        </a>
                      </p>

                      <p v-if="isLogin">
                        <!-- 回复 -->
                        <Button type="dashed"
                                @click="handleReply(l.floor || index, l.byUserId)">
                          {{ $t('detail.info.reply', {msg: 'reply'}) }}
                        </Button>
                      </p>
                    </div>
                    <!-- 认为 E -->

                    <!-- 确认:Admin S -->
                    <div v-if="l.type === 'confirm'" class="timeline-content">
                      <div class="timeline-time">
                        <Time v-if="l.createTime" :time="l.createTime"></Time>

                        <router-link :to="{name: 'account', params: {uId: `${l.byUserId}`}}">
                          <Tag v-if="l.privilege === 'admin'" color="success">
                            {{ $t('detail.info.administrator', {msg: 'administrator'}) }}
                          </Tag>
                          <b>{{ l.username }}</b>
                        </router-link>

                        <!-- 赞同此决议 S -->
                        {{ $t('detail.info.agreeWith', {msg: 'agreeWith'}) }}
                        <a @click.stop.prevent="jumpToBookmark"
                           :data-hash="`#user-verify-cheater-${l.userVerifyCheaterId}`">
                          # {{ $t('detail.info.thisChoice', {msg: 'thisChoice'}) }}
                        </a>
                        <!-- 赞同此决议 E -->

                        <!-- 作弊方式 S -->
                        ，{{ $t('detail.info.cheatMethod', {msg: 'cheatMethod'}) }}
                        <b>{{ convertCheatMethods(l.cheatMethods || '') }}</b>
                        <!-- 作弊方式 E -->
                      </div>

                      <p v-if="isLogin">
                        <!-- 回复 -->
                        <Button type="dashed"
                                @click="handleReply(l.floor || index, l.byUserId)">
                          {{ $t('detail.info.reply', {msg: 'reply'}) }}
                        </Button>
                      </p>
                    </div>
                    <!-- 确认:Admin E -->

                    <!-- 回复:any S -->
                    <div v-if="l.type === 'reply'" class="timeline-content">
                      <div class="timeline-time">
                        <Time v-if="l.createTime" :time="l.createTime"></Time>

                        <router-link v-if="l.username" :to="{name: 'account', params: {uId: `${l.id}`}}">
                          <Tag v-if="l.privilege === 'admin'" type="border">
                            {{ $t('detail.info.administrator', {msg: 'administrator'}) }}
                          </Tag>
                          <b>{{ l.username }}</b>
                        </router-link>
                        {{ $t('detail.info.reply', {msg: 'reply'}) }}
                        <span v-if="l.toFloor">
                          <a :href="`#floor-${l.toFloor}`">#{{ l.toFloor }}</a>
                        </span>
                      </div>

                      <div v-html="l.content" v-if="l.content" class="description"></div>

                      <p v-if="isLogin">
                        <!-- 回复 -->
                        <Button type="dashed"
                                @click="handleReply(l.floor || index, l.byUserId)">
                          {{ $t('detail.info.reply', {msg: 'reply'}) }}
                        </Button>
                      </p>
                    </div>
                    <!-- 回复:any E -->

                    <Row class="timeline-content">
                      <Col>
                      </Col>
                      <Col span="24" align="right"># {{ index }}</Col>
                    </Row>
                    <Divider></Divider>
                  </TimelineItem>
                  <!--                  TODO PAGE SET-->
                  <!--                  <Page :page-size="limit" show-total :current="page" :total="total" class="page" size="small"/>-->
                  <br>
                </div>

                <div label="回复">
                  <!-- 回复 S -->
                  <div v-if="isLogin">
                    <Alert type="warning" show-icon>
                      <span>{{ $t('detail.info.replyManual1', {msg: 'replyManual1'}) }}</span>
                      <b><a href="https://sm.ms/"
                            target="_blank"><span>{{
                          $t('detail.info.uploadPicButton', {msg: 'uploadPicButton'})
                        }}</span></a></b>，
                      <span>{{ $t('detail.info.replyManual2', {msg: 'replyManual2'}) }}</span>
                    </Alert>
                    <Form :label-width="80" style="position: relative;">
                      <Input @on-keydown="handleCmdEnter($event, 'reply')"
                             v-model="reply.content"
                             type="textarea"
                             :autosize="{minRows: 5}"
                             :placeholder="$t('detail.info.giveOpinion')"/>
                      <p align="right">
                        <br>
                        <Button type="primary" :loading="replySpinShow" @click.stop.prevent="doReply">
                          {{ $t('detail.info.reply', {msg: 'reply'}) }}
                        </Button>
                      </p>
                    </Form>
                  </div>
                  <Alert type="warning" show-icon v-else>
                    <template slot="desc">
                      {{ $t('detail.info.replyManual3', {msg: 'replyManual3'}) }}
                    </template>
                  </Alert>
                  <!-- 回复 E -->
                </div>
              </TabPane>
              <TabPane :label="$t('detail.info.dealRecord', { msg: 'dealRecord' })">
                <!-- 管理员处理历史 -->
                <div style="display: flex; flex-direction: column; position: relative;">
                  <div style="margin-top: .4rem;">
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
              </TabPane>
              <TabPane :label="$t('detail.info.gameScores', { msg: 'gameScores' })">
                <!-- 战绩链接 -->
                <div v-show="cheater.originUserId">
                  <p v-for="g in games" :key="g.game">
                    <Tag>
                      {{ g.game }}
                    </Tag>
                    <a v-show="`${g.game}` === 'bf1'" target="_blank"
                       :href="`https://battlefieldtracker.com/bf1/profile/pc/${cheater.originId}`">
                      battlefieldtracker
                    </a>
                    <Divider type="vertical" v-show="`${g.game}` === 'bf1'"/>
                    <a v-show="`${g.game}` === 'bf1'" target="_blank"
                       :href="`http://bf1stats.com/pc/${cheater.originId}`">
                      bf1stats
                    </a>
                    <Divider type="vertical" v-show="`${g.game}` === 'bfv'"/>
                    <a v-show="`${g.game}` === 'bfv'" target="_blank"
                       :href="`https://battlefieldtracker.com/bfv/profile/origin/${cheater.originId}`">
                      battlefieldtracker
                    </a>
                    <Divider type="vertical"/>
                    <a target="_blank" :href="`https://www.247fairplay.com/CheatDetector/${cheater.originId}`">
                      247fairplay
                    </a>
                  </p>

                  <div>
                    <a v-if="cheater.trackerShot" :href="cheater.trackerShot" target="_blank">bf1tracker数据截图</a>
                    <a v-if="cheater.trackerWeaponShot" :href="cheater.trackerWeaponShot"
                       target="_blank">bf1tracker武器截图</a>
                    <a v-if="cheater.bf1statsShot" :href="cheater.bf1statsShot" target="_blank">bf1stats数据截图</a>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </Col>
          <Col :xs="{span: 23, push: 1}" :lg="{span: 5, push: 0}" order="1" class="mobile-hide">
            <div>
              <Button type="primary" :disabled="!isLogin">此账户是我</Button>
              <p><br>该举报信息存在问题,我能自证或他人协助证明清白.</p>
              <Divider/>
            </div>
            <Affix :offset-top="10">
              <Steps :current="detailStepsIndex" direction="vertical">
                <Step title="首次提交" content="首次提交作弊玩家"></Step>
                <Step title="定案" content="最终结果"></Step>
              </Steps>
            </Affix>
          </Col>
        </Row>

        <div v-if="cheater.status === '1'">
          <Divider/>
        </div>

        <br>

        <!-- 小回复窗口 -->
        <Modal
            v-model="replyModal"
            :title="`${$t('detail.info.reply', {msg: 'reply'})} #${reply.toFloor}`"
            @on-ok="doReply"
            @on-cancel="cancelReply">
          <div v-if="isLogin">
            <Form :label-width="80" ref='replyForm' style="position: relative;">
              <Input @on-keydown="handleCmdEnter($event, 'reply')" v-model="reply.content" type="textarea"
                     :autosize="{minRows: 2}"
                     :placeholder="$t('detail.info.giveOpinion')"/>
            </Form>
          </div>
          <div v-else>{{ $t('detail.info.replyManual4', {msg: 'replyManual4'}) }}</div>
        </Modal>

        <Spin size="large" fix v-show="spinShow">
          <Icon type="ios-loading" size="50" class="spin-icon-load"></Icon>
          <p>ヾ(◍°∇°◍)ﾉﾞ load...</p>
        </Spin>
      </Card>
      <br v-if="isAdmin">
      <Card dis-hover v-if="isAdmin">
        <div :label="$t('detail.info.adminConsole', {msg: 'adminConsole'})">
          <h2 style="margin: 1rem 0;">{{ $t('detail.info.judgement', {msg: 'judgement'}) }}</h2>

          <!-- 管理员面板 S -->
          <Alert type="warning" show-icon>
            <p class="hint">{{ $t('detail.info.adminManual1', {msg: 'adminManual1'}) }}</p>
            <p class="hint">{{ $t('detail.info.adminManual2', {msg: 'adminManual2'}) }}</p>
          </Alert>

          <Form ref='verifyForm' label-position="top">
            <Row :gutter="30">
              <Col span="12">
                <FormItem label="Opinion">
                  <Select v-model="verify.status">
                    <!-- 判断选项 -->
                    <Option :value="v_i.value" v-for="v_i in verify.choice" :key="v_i.value">
                      {{ $t(`basic.status[${v_i.value}]`) }}
                    </Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="12">
                <FormItem v-show="verify.status == '1'" label="CheatMethod">
                  <Select v-model="verify.checkbox" multiple>
                    <Option v-for="method in cheatMethodsGlossary" :key="method.value" :value="method.value">
                      {{ $t(`cheatMethods.${method.value}.title`) }} |
                      {{ $t(`cheatMethods.${method.value}.describe`) }}
                    </Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="24">
                <FormItem label="Reason">
                  <Input @on-keydown="handleCmdEnter($event, 'verify')" v-model="verify.suggestion"
                         type="textarea"
                         :autosize="{minRows: 2}" placeholder="Write something"/>
                </FormItem>
              </Col>
            </Row>

            <FormItem>
              <Button type="primary" @click.stop.prevent="doVerify">
                {{ $t('detail.info.commit', {msg: 'commit'}) }}
              </Button>
            </FormItem>

            <Spin size="large" fix v-show="verifySpinShow"></Spin>
          </Form>
          <!-- 管理员面板 E -->
        </div>
      </Card>
      <div v-if="!isCheaterExist">
        <Empty></Empty>
      </div>
    </div>
    <BackTop :bottom="50">
      <div class="top mobile-hide">Top</div>
    </BackTop>
    <br>
  </div>
</template>

<script>
import BFBAN from "../assets/js/bfban";

import {http, api, http_token, util} from '../assets/js/index'
import vueQr from 'vue-qr'
import translate from 'google-translate-open-api';
import Empty from '../components/Empty.vue'
import {
  formatTextarea,
  waitForAction
} from "@/mixins/common";

export default new BFBAN({
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
        choice: [],
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

      isCheaterExist: true,

      replyModal: false,

      cheatMethodsGlossary: null,

      fastReply: {
        content: ['stats', 'evidencePic', 'evidenceVid'],
        selected: [],
      },

      updateUserInfospinShow: false,
      detailStepsIndex: 0
    }
  },
  components: {Empty, vueQr},
  watch: {
    '$route': 'loadData',
    'fastReply.selected': function () {
      this.verify.suggestion = '' + this.fastReply.selected.map(i => this.$t(`detail.info.fastReplies.${i}`));
    }
  },
  created() {
    this.loadData();
    this.getCheatersInfo();
    this.getTimeline();
  },
  methods: {
    getCheaterStatusLabel: util.getCheaterStatusLabel,
    convertCheatMethods: util.convertCheatMethods,
    async loadData() {
      // set Token Http mode
      this.http = http_token.call(this);

      await util.initUtil().then((res) => {
        this.cheaterStatus = res.cheaterStatus;

        // 裁决结果
        this.cheatMethodsGlossary = res.cheatMethodsGlossary;

        // 裁决作弊类型
        this.verify.choice = res.cheaterStatus.filter(i => (i.value >= 1 && i.value <= 4));
      });
    },
    /**
     * 获取基本字段
     * 从[url]中整理
     */
    getParamsIds() {
      const object_id = this.$route.params.ouid.split('.');
      return {
        userId: object_id[1],
        personaId: object_id[0],
        dbId: object_id[2],
      };
    },
    /**
     * 获取作弊者档案
     * 基础信息
     */
    getCheatersInfo() {
      this.http.get(api["cheaters"], {
        params: Object.assign({
          history: true
        }, this.getParamsIds())
      }).then((res) => {
        this.spinShow = false;
        const d = res.data;

        if (d.success === 1) {
          this.cheater = d.data;
          this.cheater.games.split(',').forEach(i => {
            this.games.push({game: i});
          })
        } else {
          this.$router.push({name: "notFound"});
        }
      }).catch(() => {
        this.$router.push({name: "notFound"});
      });
    },
    /**
     * 时间轴
     * 档案日历
     */
    getTimeline() {
      this.http.get(`${api["account_timeline"]}`, {
        params: Object.assign({
          skip: 0,
          limit: 100
        }, this.getParamsIds())
      }).then((res) => {
        const d = res.data;
        if (d.success === 1) {
          let timelineList = d.data;
          let countNum = [0, 0];

          timelineList.forEach(i => {
            if (i.type == 'report')
              countNum[0] += 1;
            if (i.type == 'judgement')
              countNum[1] += 1;
          });

          if (countNum[0] <= 1) {
            this.detailStepsIndex = 0;
          }
          if (countNum[1] > 1) {
            this.detailStepsIndex = 1;
          }

          this.timelineList = timelineList;
        }
      });
    },
    /**
     * 赞同此决议
     */
    jumpToBookmark(e) {
      let hash = e.target.dataset.hash;
      let el = document.querySelector(hash);

      // offset top 一层层 依次累加
      let offsetY = el.offsetParent.offsetTop + el.offsetParent.offsetParent.offsetTop + el.offsetParent.offsetParent.offsetParent.offsetTop - document.querySelector('header').offsetHeight;

      document.documentElement.scrollTop = offsetY;

      el.setAttribute('style', 'background: rgba(255, 153, 1, 0.15)');
      setTimeout(function () {
        el.setAttribute('style', 'transition: background 1s ease .5s;')
      }, 100);
    },
    async doVerify() {
      const {status} = this.verify;
      let {suggestion} = this.verify;
      const cheatMethods = this.verify.checkbox.join(',');
      const {originUserId} = this.cheater;

      if ((status === '1' && cheatMethods === '') || suggestion.trim() === '') {
        this.$Message.warning(this.$i18n.t('detail.messages.fillEverything'));
        return false;
      }
      if ((status === '3' || status === '4') && suggestion.trim().length < 5) { // too short
        this.$Message.warning(this.$i18n.t('detail.messages.pleaseExplain'));
        return false;
      }
      if ('0123456789abcedfghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,-_'.split('').indexOf(suggestion.trim()) != -1) { // one letter suggestion
        this.$Message.warning(this.$i18n.t('detail.messages.dontDoIt') + suggestion);
        return false;
      }
      // JUST before ajax
      this.verifySpinShow = true;

      const {data: statusData} = await http.post('/cheaters/status', {
        data: {originUserId}
      })
      // const {data: statusData} = await ajax({
      //   method: 'post',
      //   url: '/cheaters/status',
      //   data: {
      //     originUserId,
      //   }
      // });
      if (statusData.error) {
        this.$Message.error(statusData.msg);
        return false;
      }
      if (statusData.error === 0 && statusData.status === '1') {
        if (!confirm(this.$i18n.t('detail.messages.changeHacker', {code: this.$i18n.t(`basic.status[${status}]`)}))) {
          this.verifySpinShow = false;
          return false;
        }
      }

      suggestion = formatTextarea(suggestion);

      let actions = await import('/src/assets/action.json');
      this.http.post(api["player_judgement"], {
        data: {
          data: {
            toPlayerId: this.cheater.id,
            cheatMethods: cheatMethods,
            action: actions.action[status].value,
            content: suggestion,
          },
        }
      }).then((res) => {
        this.verifySpinShow = false;

        const d = res.data;
        if (res.data.success === 1) {
          // reset verifyForm
          this.verify.status = '1';
          this.verify.suggestion = '';
          this.verify.checkbox = [];

          const {id, userId, createDatetime, status, suggestion, username, cheatMethods, privilege} = d.data;

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

          this.$Message.success(this.$i18n.t('detail.messages.submitSuccess'));
        } else {
          this.$Message.error('failed ' + d.msg);
        }
      })
    },
    doConfirm(e) {
      const {userVerifyCheaterId, userVerifyCheaterUsername, cheatMethods} = e.target.dataset;
      const {userId} = this.$store.state.user;
      const originUserId = this.$route.params.ouid;

      http.post(api["cheaters_confirm"], {
        data: {
          userVerifyCheaterId,
          userId,
          originUserId,
          cheatMethods,
        }
      }).then((res) => {
        const d = res.data;

        if (d.error === 0) {
          const {createDatetime} = d.data;

          this.cheater.status = '1';
          this.timelineList.push({
            type: 'confirm',
            userId,
            userVerifyCheaterId,
            createDatetime,
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
    handleReply(floor, userId) {
      this.reply.toFloor = floor === 'undefined' ? '' : floor;
      this.reply.toUserId = userId === 'undefined' ? '' : userId;

      // open reply modal
      this.replyModal = true;
    },
    /**
     * 评论取消
     * 行为: 重置内容
     */
    cancelReply() {
      this.reply = {};
    },
    /**
     * 评论 reply
     */
    doReply() {
      this.replySpinShow = true;

      const cheaterId = this.cheater.id;
      const {toFloor, toUserId} = this.reply;
      let {content = ''} = this.reply;

      content = formatTextarea(content);

      let data = {
        data: {
          toPlayerId: cheaterId,
          content: content,
          toFloor: 1,
        },
      };

      if (toFloor) {
        data.data['toFloor'] = toFloor;
      }
      if (toUserId) {
        data.data['toUserId'] = toUserId;
      }

      this.http.post(api["player_reply"], {
        data,
      }).then((res) => {
        const d = res.data;

        if (d.success == 1) {
          const {createDatetime, content, status} = d.data;

          this.$Message.success(this.$i18n.t('detail.messages.replySuccess'));

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
          this.$Message.error(d.msg);
        }
      }).finally(() => {
        this.replySpinShow = false;

        // update timelink
        this.getTimeline();
      });
    },
    handleCmdEnter(e, type) {
      if ((e.metaKey || e.ctrlKey) && e.keyCode == 13) {
        switch (type) {
          case 'reply':
            this.doReply()
            break;
          case 'verify':
            this.doVerify();
            break;
        }
      }
    },
    /**
     * 更新玩家信息
     * update cheater
     * @param e
     * @returns {boolean}
     */
    updateCheaterInfo(e) {
      waitForAction.call(e.target, 60);

      if (!this.$store.state.user) {
        this.$Message.error(this.$i18n.t('detail.messages.signIn'));
        return false;
      }

      this.updateUserInfospinShow = true;
      const {originUserId} = this.cheater;

      this.http.post(api["player_update"], {
        data: Object.assign(this.getParamsIds())
      }).then((res) => {
        this.updateUserInfospinShow = false;

        const d = res.data;
        if (d.error === 0) {
          const {cheaterGameName: originId, originUserId, avatarLink} = d.data.origin;

          this.cheater.originId = originId;
          this.cheater.originUserId = originUserId;
          this.cheater.avatarLink = avatarLink;

          this.origins.unshift(d.data.origin);

          this.$Message.success(this.$i18n.t('detail.messages.updateComplete'));
        } else {
          this.$Message.error(d.msg);
        }
      });
    },
    /**
     * TODO fix
     * 18I 翻译
     * 引擎: google
     * @param index
     * @returns {Promise<void>}
     */
    async onTranslate(index) {
      let that = this;

      // delete key
      if (that.timelineList[index].description_cont) {
        that.timelineList[index].description = that.timelineList[index].description_cont;
        delete that.timelineList[index].description_cont;
      }

      const result = await translate(that.timelineList[index].description, {
        to: "zh-CN",
      });

      that.timelineList[index].description_cont = that.timelineList[index].description;
      that.timelineList[index].description_translate = result.data[0];
    },
  },
  computed: {
    isAdmin() {
      const user = this.$store.state.user;
      const is = user ? user.userinfo.privilege !== 'normal' : false;

      return Boolean(is);
    },
    isLogin() {
      return Boolean(this.$store.state.user)
    },
    currentUser() {
      return this.$store.state.user
    }
  }
})
</script>

<style lang="scss">
.cheater-desc {
  max-width: 100%;
  width: 34rem;
}

.description {
  color: rgba(0, 0, 0, 0.8);
  font-size: 0.8rem;
  line-height: 1.5rem;
  margin: 10px 0;
  border: 1px solid #f2f2f2;
  background: #f8f9fa;
  padding: 10px;

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

  // force to wrap
  overflow-wrap: break-word;
  word-wrap: break-word;

  margin-left: 2rem;
}

.timeline-content .loading {
  background-image: url('/src/assets/fonts/loading.svg');
  background-repeat: no-repeat;
  min-width: 100px;
  min-height: 100px;
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
</style>

<style>
.spin-icon-load {
  animation: ani-demo-spin 1s linear infinite;
}

@keyframes ani-demo-spin {
  from {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.top {
  position: fixed;
  right: calc(50% - (960px / 2) - 44px);
  top: 20%;
  transform: translateY(-20%);
  z-index: 100;
  background-color: #ffffff;
  border: 1px solid #f2f2f2;
  padding: 10px;
}
</style>
