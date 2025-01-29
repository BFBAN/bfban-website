<script setup>
import {account_storage, api, http_token, player_storage, util} from "@/assets/js";
import UserAvatar from "@/components/UserAvatar.vue";
import BusinessCard from "@/components/BusinessCard.vue";
import TimeView from "@/components/TimeView.vue";
import HtmlCore from "@/components/Html.vue";
import HtmlWidget from "@/components/HtmlWidget.vue";
import Htmllink from "@/components/HtmlLink.vue";
import Application from "@/assets/js/application";
import Empty from "@/components/Empty.vue";
import judgeActionTypeView from "@/components/judgeActionTypeView.vue";
import Loading from "@/components/Loading.vue";
import timeline from "view-design/src/components/timeline";

export default new Application({
  props: {
    // {*|{dbId: *, userId: *, personaId: *}}
    id: {
      type: String,
      default: ''
    },
    isDisabledUpdateName: {
      type: Boolean,
      default: false
    },
    isDisabledReply: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      util,

      cheater: {},

      timelineListPreparedness: [],
      timelineList: [],
      timeline: {
        load: true,
        order: 'asc',
        skip: 1,
        limit: 20,
        total: 0,
        seeType: 1,
        seeTypeList: [
          {
            label: 'all',
            value: 1,
            item: ['report', 'reply', 'ban_appeal', 'judgement', 'verify', 'banAppeal', 'historyUsername'],
          },
          {
            label: 'coreComment',
            value: 4,
            item: ['report', 'reply', 'ban_appeal', 'judgement', 'verify', 'banAppeal'],
          },
          {
            label: 'verify',
            value: 2,
            item: ['judgement', 'verify'],
          },
          {
            label: 'banAppeal',
            value: 3,
            item: ['banAppeal'],
          },
          {
            label: 'historyName',
            value: 5,
            item: ['historyUsername'],
          }
        ]
      },
    }
  },
  components: {
    BusinessCard,
    TimeView,
    HtmlCore,
    HtmlWidget,
    Htmllink,
    UserAvatar,
    judgeActionTypeView,
    Loading,
    Empty,
  },
  watch: {
    '$route': 'loadData',
    'id': 'loadData'
  },
  created() {
    this.http = http_token.call(this);
    this.loadData();
  },
  methods: {
    async loadData() {
      const {page = 0, order = 'asc'} = this.$route.query;

      // set Token Http mode
      this.http = http_token.call(this);

      this.timeline.seeType = this.getSeeType;
      if (page) {
        this.timeline.skip = Number(page);
        this.timeline.page = Number(page);
      }
      if (order) this.timeline.order = order;

      await this.getPlayerInfo();
      await this.getTimeline();
    },
    /**
     * 获取玩家档案
     */
    async getPlayerInfo() {
      if (!this.id) return;

      this.cheater = await player_storage.getPlayerInfo({personaId: this.id}, true);
    },
    /**
     * 获取举报玩家 时间轴
     */
    async getTimeline(id) {
      this.timelineListPreparedness = [];
      this.timelineList = [];

      if (!this.id) return;

      try {
        this.timeline.load = true;

        const res = await this.http.get(api["player_timeline"], {
          params: Object.assign({
            skip: (this.timeline.skip - 1) * this.timeline.limit,
            limit: this.timeline.limit,
            order: this.timeline.order,
          }, {
            personaId: id || this.id,
            random: +(new Date())
          })
        })

        let d = res.data;

        if (d.success === 1) {
          d.data.result.forEach((i, index) => {
            if (i.videoLink) {
              let videoLink = i.videoLink.split(',');
              if (videoLink instanceof Array)
                for (let j = 0; j < videoLink.length; j++)
                  if (videoLink[j].indexOf('http') >= 0) videoLink[j] = new URL(videoLink[j]);
              i.videoLink = videoLink;
            }

            i.index = index;
            i.show = false;
          });

          this.timelineListPreparedness = d.data.result;
          this.timeline.total = d.data.total;

          // 排序
          this.onMergeHistoryName();

          this.$forceUpdate();
        }

        this.onRollingFloor();
        this.timeline.load = false;
      } finally {
        this.$emit('ready');
        this.timeline.load = false;
      }
    },
    /**
     * 获取 时间轴 单条数据
     * @param {string} id
     * @returns {Promise}
     */
    async getTimeLineItemData(id) {
      let commentData = null;  // 用于保存获取到的数据
      await this.http
          .get(api["player_timeline_item"], {params: {id}})
          .then(res => {
            const d = res.data;
            if (d.success === 1) {
              // 请求成功，处理返回的数据
              commentData = d.data;
            } else {
              switch (d.code) {
                case "commentItem.bad":
                case "commentItem.notFound":
                  this.$Message.info(this.$t('basic.tip.notFound'));
                  break;
              }
            }
          }).finally(() => {
            // 请求结束后的处理
            // 如果有加载动画，此时应该隐藏
            this.loading = false;
            // 如果有UI元素在请求期间被禁用，此时应该解除禁用
            this.isButtonDisabled = false;
          });

      return commentData;  // 返回获取到的数据
    },
    /**
     * 时间轴分页事件
     */
    handlePageChange(num) {
      this.timeline.skip = num;
      this.$router.push({
        name: this.$router.name,
        query: {...this.$route.query, page: num}
      });

      this.$refs.timeline.getTimeline();

      const commentNode = document.getElementById('timeline');
      this.onRollingNode(commentNode.offsetTop);
    },
    /**
     * 滚动至楼层位置
     * @param id
     */
    onRollingFloor(id) {
      const that = this;
      // 锚点
      that.url = new URL(window.location.href);
      if (that.url.hash || id) {
        let urlOffsetTop = document.getElementById(
            (id || that.url.hash).replaceAll('#', '')
        );
        let className = urlOffsetTop?.offsetParent.className;

        // 检查内容ID是否在网页中，没有则终止滚动
        if (!urlOffsetTop) return;

        urlOffsetTop.offsetParent.className = className + " timeline-scroll-floor";
        setInterval(function () {
          if (urlOffsetTop.offsetParent)
            urlOffsetTop.offsetParent.className = className;
        }, 10000);

        this.onRollingNode(urlOffsetTop.offsetParent.offsetParent.offsetTop);
      }
    },
    /**
     * 获取基本字段
     * 从[url]中整理
     * @param {string} name
     * @returns {*|{dbId: *, userId: *, personaId: *}}
     */
    getParamsIds(name) {
      const object_id = this.$route.params.ouid.split('.');
      const object = {
        userId: object_id[1],
        personaId: object_id[0],
        dbId: object_id[2],
      };
      return name ? object[name] : object;
    },
    /**
     * 时间轴筛选,依次条件筛选
     * @param {number} index 时间轴下标
     * @returns {boolean}
     */
    filtrateTimelineItem(index) {
      const that = this;
      const list = this.timeline.seeTypeList;

      return list
          .filter(i => Number(that.timeline.seeType) == i.value)[0]?.item
          .indexOf(this.timelineList[index].type) >= 0;
    },
    /**
     * 时间轴更新状态
     */
    onUpdateSeeType() {
      account_storage.updateConfiguration("timelineSeeType", this.timeline.seeType);
    },
    /**
     * 合并时间轴历史名称
     */
    onMergeHistoryName() {
      const that = this;
      const {order} = this.timeline;
      let _timelineList = this.timelineListPreparedness;
      let _timeStartAndEndTime = {
        0: this.getTime(_timelineList[0].createTime),
        1: this.getTime(_timelineList[_timelineList.length - 1].createTime)
      };

      this.cheater.history.forEach((history, hisrotyIndex) => {
        let _itemHistoryTime = this.getTime(history.fromTime);

        // Check if the history is within the timeline range
        if (_itemHistoryTime >= _timeStartAndEndTime[order === 'asc' ? 0 : 1] && _itemHistoryTime <= _timeStartAndEndTime[order === 'asc' ? 1 : 0]) {
          _timelineList.push({
            type: 'historyUsername',
            beforeUsername: this.cheater.history[hisrotyIndex - 1]?.originName,
            nextUsername: history.originName,
            fromTime: history.fromTime
          });
        }
      });

      this.timelineList = _timelineList.sort(function (x, y) {
        let timeX = (that.getTime(x.createTime) || that.getTime(x.fromTime));
        let timeY = (that.getTime(y.createTime) || that.getTime(y.fromTime));
        return order === 'asc' ? timeX - timeY : timeY + timeX;
      });
    },
    getTime(dateString) {
      return new Date(dateString).getTime();
    },
    /**
     * 分享楼层
     * @param {number} floorId 楼层id，同时也是回复id
     * @returns {string} URL
     */
    getShareFloor(floorId) {
      let _url = new URL(window.location.href);
      if (!floorId) return _url;
      _url.hash = "#floor-" + floorId;
      return _url.toString() || "";
    },


  },
  computed: {
    userAvatarSize() {
      return 20
    },
    /**
     * 时间轴可见类型，筛选
     * @returns {*|boolean}
     */
    getSeeType() {
      let value = account_storage.getConfiguration("timelineSeeType");
      if (typeof value == 'boolean' && !value) value = this.timeline.seeType;
      return value;
    },
  }
})
</script>

<template>
  <div class="timeline-view">
    <Card dis-hover v-if="timelineList.length <= 0">
      <Empty :not-hint="true"></Empty>
    </Card>

    <div>
      <!-- 时间轴 S -->
      <TimelineItem
          pending
          class="timeline-time-line"
          v-show="filtrateTimelineItem(index)"
          v-for="(l, index) in timelineList"
          :key="index"
          :color="l.privilege === 'admin' ? 'red' : 'green'"
          :ref="`floor-${l.index}`"
          :id="`floor-${l.index}`">
        <div v-if="l.type === 'report'" slot="dot" class="timeline-time-dot ivu-tag-warning hand">
          <Icon type="ios-hand" :size="isMobile ? 13 : 20"></Icon>
        </div>
        <div v-else-if="l.type === 'reply'" slot="dot" class="timeline-time-dot ivu-tag-geekblue reply">
          <Icon type="ios-text" :size="isMobile ? 13 : 20" class="ivu-tag-text"></Icon>
        </div>
        <div v-else-if="l.type === 'banAppeal'" slot="dot"
             class="timeline-time-dot ivu-tag-magenta ban_appeal">
          <Icon type="md-bookmark" :size="isMobile ? 13 : 20" class="ivu-tag-text"></Icon>
        </div>
        <div v-else-if="l.type === 'judgement'" slot="dot"
             class="timeline-time-dot ivu-tag-primary ban_appeal">
          <Icon type="ios-medical" :size="isMobile ? 13 : 20" class=""></Icon>
        </div>
        <div v-else-if="l.type === 'verify'" slot="dot" class="timeline-time-dot trophy">
          <Icon type="ios-share-alt" :size="isMobile ? 13 : 20"></Icon>
        </div>
        <div v-else-if="l.type === 'historyUsername'" slot="dot"
             class="timeline-time-dot ivu-tag-gold">
          <Icon type="ios-time" :size="isMobile ? 13 : 20" class="ivu-tag-text"></Icon>
        </div>
        <div v-else slot="dot" class="timeline-time-dot ivu-tag-border ivu-tag-text out">
          <Icon type="ios" :size="isMobile ? 13 : 20" class=""></Icon>
        </div>

        <!-- 历史名称 S -->
        <div v-if="l.type === 'historyUsername'" class="timeline-content">
          <div class="timeline-time">
            <Row>
              <Col flex="1">
                {{ $t('detail.appeal.info.changeName') }}
              </Col>
              <Col>
                <TimeView :time="l.fromTime">
                  <Time :time="l.fromTime" v-if="l.fromTime" type="datetime"></Time>
                </TimeView>
              </Col>
            </Row>
          </div>
          <Card :padding="0" dis-hover
                class="timeline-description ivu-tag-gold ivu-card ivu-card-bordered ivu-card-dis-hover"
                style="padding: 15px 0">
            <Dropdown :transfer="isMobile" placement="bottom-start" style="width: 100%">
              <Row :gutter="16" type="flex" justify="center" align="middle">
                <Col class="text-distinguishing-letter">
                  <code>{{ l.beforeUsername || "N/A" }}</code>
                </Col>
                <Col class="mobile-hide">
                  <Icon type="md-arrow-round-forward" class="ivu-tag-text" size="20" style="opacity: .6"/>
                </Col>
                <Col class="desktop-hide" align="center" :xs="{span: 24}">
                  <Icon type="md-arrow-round-forward" size="20" style="opacity: .6;transform: rotate(90deg)"/>
                </Col>
                <Col>
                  <b class="text-distinguishing-letter"><code>{{ l.nextUsername || "N/A" }}</code></b>
                </Col>
              </Row>

              <!-- 历史ID -->
              <DropdownMenu slot="list"
                            style="width: 100%"
                            v-if="cheater && cheater.history && cheater.history.length >= 0">
                <Row style="margin: 5px 18px">
                  <Col flex="1">
                    <b>{{ $t('detail.info.historyID') }}</b>
                  </Col>
                </Row>
                <div style="overflow: auto; max-height: 80vh">
                  <div v-for="(origin, origin_index) in cheater.history" :key="origin_index">
                    <Row :gutter="5" type="flex" align="middle"
                         style="padding: 0 16px;margin: 10px 0 ; width:100%">
                      <Col>
                        <TimeView :time="origin.fromTime">
                          <Time :time="origin.fromTime"
                                v-if="origin.fromTime && l.fromTime != origin.fromTime"></Time>
                          <b v-else>
                            <Time :time="origin.fromTime" v-if="origin.fromTime"></Time>
                          </b>
                        </TimeView>
                      </Col>
                      <Col flex="1">
                        <Divider dashed style="margin: 0"/>
                      </Col>
                      <Col class="text-distinguishing-letter">
                        <template v-if="l.fromTime == origin.fromTime">
                          <Tag color="primary"><code>{{ origin.originName }}</code></Tag>
                        </template>
                        <template v-else>
                          <code>{{ origin.originName }}</code>
                        </template>
                      </Col>
                    </Row>
                  </div>
                </div>
              </DropdownMenu>
            </Dropdown>
          </Card>

          <Row type="flex" align="middle">
            <Col flex="auto">
              <template v-if="isLogin && !isDisabledUpdateName">
                <Button size="small" @click="$emit('click-update-name', true)">
                  {{ $t('detail.info.updateButton') }}
                </Button>
              </template>
            </Col>
          </Row>
        </div>
        <!-- 历史名称 E -->

        <!-- 举报:any S -->
        <div :id="`floor-${l.id}`" v-if="l.type === 'report'" class="timeline-content">
          <div class="timeline-time">
            <Row :gutter="5" type="flex" align="middle">
              <Col flex="1">
                <BusinessCard :id="l.byUserId">
                  <Tag fade color="transparent" class="avatar">
                    <UserAvatar :src="l.byUserAvatar" :size="userAvatarSize"></UserAvatar>
                  </Tag>

                  <router-link :to="{name: 'space', params: {uId: `${l.byUserId}`}}">
                    <u><b>{{ l.username || l.byUserId }}</b></u>
                  </router-link>
                </BusinessCard>

                <!-- 举报 -->
                {{ $t('detail.info.report') }}
                <a><u><b class="text-distinguishing-letter"><code>{{ l.toOriginName }}</code></b></u></a>

                <template v-if="l.cheatGame">
                  <!-- 在 -->
                  {{ $t('detail.info.inGame') }}

                  <router-link
                      :to="{name: 'player_list', params: { ouid: l.originPersonaId }, query: {game: l.cheatGame, status: -1 } }">
                    <Tooltip :content="$t('basic.games.' + l.cheatGame)">
                      <Tag type="border">
                        <img height="12"
                             :src="require('/src/assets/images/games/' + l.cheatGame + '/logo.png')"/>
                      </Tag>
                    </Tooltip>
                  </router-link>
                </template>

                <!-- 游戏中 -->
                {{ $t('detail.info.gaming') }}

                <Tag type="border" color="orange"
                     v-for="(methods, methodsIndex) in l.cheatMethods"
                     :key="methodsIndex">
                  <Poptip trigger="hover" :transfer="true" word-wrap width="200"
                          :content='$t("cheatMethods." + util.queryCheatMethodsGlossary(methods) + ".describe")'>
                    {{ $t("cheatMethods." + util.queryCheatMethodsGlossary(methods) + ".title") }}
                  </Poptip>
                </Tag>
              </Col>
              <Col>
                <TimeView :time="l.createTime">
                  <Time :time="l.createTime" v-if="l.createTime" type="datetime"></Time>
                </TimeView>
              </Col>
            </Row>
          </div>

          <template v-if="l.videoLink">
            <Row :gutter="10" type="flex" align="middle" v-for="(link, linkindex) in l.videoLink"
                 :key="linkindex">
              <Col class="user-select-none">
                <Tag color="geekblue">{{ $t('detail.info.videoLink') }}</Tag>
              </Col>
              <Col style="max-width: 60%">
                          <span style="display: block;white-space: nowrap; overflow: hidden;text-overflow: ellipsis;">
                            <a :href="link.href" target="_blank">
                              <span style="opacity: .8" v-if="link.href">
                                <Htmllink :href="encodeURI(link.href)" :text="encodeURI(link.href)"></Htmllink>
                              </span>
                            </a>
                          </span>
              </Col>
              <Col flex="1">
                <Divider dashed style="margin: 0;min-width: 100px"></Divider>
              </Col>
              <Col class="user-select-none">
                {{ linkindex + 1 }}
              </Col>
            </Row>
          </template>

          <HtmlWidget class="timeline-description ivu-card ivu-card-bordered ivu-card-dis-hover"
                      :html="l.content.text" v-if="l.content.text"></HtmlWidget>
        </div>
        <!-- 举报:any E -->

        <!-- 申诉:any S -->
        <div :id="`floor-${l.id}`" v-if="l.type === 'banAppeal'" class="timeline-content">
          <div class="timeline-time">
            <Row>
              <Col flex="auto">
                <Tag fade color="transparent" class="avatar">
                  <UserAvatar :src="l.byUserAvatar" :size="userAvatarSize"></UserAvatar>
                </Tag>

                <BusinessCard :id="l.byUserId">
                  <router-link :to="{name: 'space', params: {uId: `${l.byUserId}`}}">
                    <u><b>{{ l.username || l.byUserId }}</b></u>
                  </router-link>
                </BusinessCard>

                {{ $t('detail.appeal.info.content') }}

                <Tag type="border">{{ l.content.appealType || 'none' }}</Tag>

                <BusinessCard :id="l.originUserId">
                  <u>{{ l.cheaterGameName }}</u>
                </BusinessCard>

                <router-link :to="{name: 'player_list', query: {game: `${l.cheatGame}`} }" v-if="l.cheatGame">
                  <Tooltip :content="$t('basic.games.' + l.cheatGame)">
                    <Tag type="border">
                      <img height="12"
                           :src="require('/src/assets/images/games/' + l.cheatGame + '/logo.png')"/>
                    </Tag>
                  </Tooltip>
                </router-link>
              </Col>

              <Col>
                <TimeView :time="l.createTime">
                  <Time :time="l.createTime" v-if="l.createTime" type="datetime"></Time>
                </TimeView>
                <Divider type="vertical"/>
                <Tag type="border" color="primary">
                  {{ $t(`detail.appeal.deal.stats.${l.appealStatus || 'unprocessed'}`) }}
                </Tag>
              </Col>
            </Row>
          </div>
          <HtmlWidget :html="l.content.text"
                      v-if="l.content.text"
                      class="timeline-description ivu-card ivu-card-bordered ivu-card-dis-hover"></HtmlWidget>

          <template v-if="isLogin && l.content.extendedLinks">
            <Row :gutter="5">
              <Col v-if="l.content.extendedLinks.btrLink">
                <Poptip trigger="click" max-width="300" width="300">
                  <Badge text="BTR">
                    <Card :padding="5" dis-hover>
                      <Icon type="ios-link" size="50"/>
                    </Card>
                  </Badge>
                  <EditLinks
                      slot="content"
                      :links="l.content.extendedLinks.btrLink"
                      :isReadonly="true"></EditLinks>
                </Poptip>
              </Col>
              <Col v-if="l.content.extendedLinks.videoLink">
                <Poptip trigger="click" max-width="300" width="300">
                  <Badge text="Video Link">
                    <Card :padding="5" dis-hover>
                      <Icon type="ios-videocam" size="50"/>
                    </Card>
                  </Badge>
                  <EditLinks slot="content"
                             :links="l.content.extendedLinks.videoLink"
                             :isReadonly="true"></EditLinks>
                </Poptip>
              </Col>
              <Col v-if="l.content.extendedLinks.mossDownloadUrl">
                <Poptip trigger="click" max-width="300" width="300">
                  <Badge text="Moss File">
                    <Card :padding="5" dis-hover>
                      <Icon type="ios-download" size="50"/>
                    </Card>
                  </Badge>
                  <EditLinks slot="content"
                             :links="l.content.extendedLinks.mossDownloadUrl"
                             :isReadonly="true"></EditLinks>
                </Poptip>
              </Col>
            </Row>
          </template>
          <template v-else-if="l.content.hasOwnProperty('extendedLinks')">
            <Alert show-icon type="info" :banner="true" :fade="false">
              {{ $t('detail.timeline.noAppealAttachmentHint') }}
            </Alert>
          </template>
          <template v-else-if="!isLogin">
            <Alert show-icon type="warning" :banner="true" :fade="false">
              {{ $t('detail.timeline.needLoginViewAttachmentsHint') }}
            </Alert>
          </template>
        </div>
        <!-- 申诉:any E -->

        <!-- 认为:any S -->
        <div :id="`floor-${l.id}`" v-if="l.type === 'verify' || l.type === 'judgement'"
             class="timeline-content bookmark">
          <div class="timeline-time">
            <Row :gutter="5" type="flex" align="middle">
              <Col>
                <Tag fade color="transparent" class="avatar">
                  <UserAvatar :src="l.byUserAvatar" :size="userAvatarSize"></UserAvatar>
                </Tag>

                <BusinessCard :id="l.byUserId">
                  <router-link :to="{name: 'space', params: {uId: `${l.byUserId}`}}">
                    <u><b>{{ l.username || l.byUserId }}</b></u>
                  </router-link>
                </BusinessCard>
              </Col>
              <Col>
                {{ $t('detail.info.judge') }}

                <judgeActionTypeView :judgeAction="l.judgeAction"></judgeActionTypeView>

                <template v-if="l.cheatGame">
                  <!-- 在 -->
                  {{ $t('detail.info.inGame') }}

                  <Tooltip :content="$t('basic.games.' + l.cheatGame)">
                    <Tag type="border">
                      <img height="12"
                           :src="require('/src/assets/images/games/' + l.cheatGame + '/logo.png')"/>
                    </Tag>
                  </Tooltip>
                </template>

                <!-- 作弊方式 -->
                <template v-if="l.cheatMethods && l.cheatMethods.length > 0">
                  {{ $t('detail.info.cheatMethod') }}

                  <Tag type="border" color="orange"
                       v-for="(methods, methodsIndex) in l.cheatMethods"
                       :key="methodsIndex">
                    <Poptip trigger="hover" :transfer="true" word-wrap width="200"
                            :content='$t("cheatMethods." + util.queryCheatMethodsGlossary(methods) + ".describe")'>
                      {{ $t("cheatMethods." + util.queryCheatMethodsGlossary(methods) + ".title") }}
                    </Poptip>
                  </Tag>
                </template>
              </Col>
              <Col flex="1"></Col>
              <Col>
                <TimeView :time="l.createTime">
                  <Time v-if="l.createTime" :time="l.createTime" type="datetime"></Time>
                </TimeView>
              </Col>
            </Row>
          </div>

          <HtmlWidget :html="l.content.text" v-if="l.content.text"
                      class="timeline-description ivu-card ivu-card-bordered ivu-card-dis-hover"></HtmlWidget>
        </div>
        <!-- 认为:any E -->

        <!-- 回复:any S -->
        <div :id="`floor-${l.id}`" v-if="l.type === 'reply'" class="timeline-content">
          <div class="timeline-time">
            <Row :gutter="5" type="flex" justify="center" align="middle">
              <Col>
                <Tag fade color="transparent" class="avatar">
                  <UserAvatar :src="l.byUserAvatar" :size="userAvatarSize"></UserAvatar>
                </Tag>

                <BusinessCard :id="l.byUserId">
                  <router-link :to="{name: 'space', params: {uId: `${l.byUserId}`}}">
                    <u><b>{{ l.username || l.byUserId }}</b></u>
                  </router-link>
                </BusinessCard>
              </Col>
              <Col>
                {{ $t('basic.button.reply') }}
              </Col>
              <Col flex="1"></Col>
              <Col>
                <TimeView :time="l.createTime">
                  <Time v-if="l.createTime" :time="l.createTime" type="datetime"></Time>
                </TimeView>
              </Col>
            </Row>
          </div>

          <div class="timeline-description ivu-card ivu-card-bordered ivu-card-dis-hover"
               :class="[isLogin && l.byUserId == currentUser.userinfo.userId ? 'ivu-tag-geekblue' : '']">
            <template v-if="l.quote">
              <div @click="onRollingFloor(`floor-${l.quote.id}`)"
                   class="timeline-description timeline-reply-description user-select-none ivu-card ivu-card-bordered ivu-card-dis-hover">
                <Row type="flex" align="middle" class="timeline-reply-description-title">
                  <Col flex="1">
                    <BusinessCard :id="l.quote.byUserId">
                      <p>
                        <u><b>{{ l.quote.username }}</b></u>
                      </p>
                    </BusinessCard>
                    :
                  </Col>
                  <Col>
                    <Time :time="l.quote.createTime" type="datetime"></Time>
                  </Col>
                </Row>
                <HtmlCore
                    :html="l.quote.content.length > 80 ? `${l.quote.content.substr(0, 80)}...` : l.quote.content"></HtmlCore>
              </div>
            </template>

            <HtmlWidget :html="l.content.text" v-if="l.content.text"></HtmlWidget>
          </div>
        </div>
        <!-- 回复:any E -->

        <Row class="timeline-content-footer" type="flex" align="middle">
          <Col flex="1" v-if="l.type !== 'historyUsername'">
            <template v-if="isLogin && !isDisabledReply">
              <!-- 回复 -->
              <Button size="small"
                      v-voice-button
                      v-if="l.id && l.byUserId"
                      @click="$emit('click-reply',l.id, l.byUserId)">
                {{ $t('basic.button.reply') }}
              </Button>
              <Divider type="vertical"/>
            </template>

            <!-- 申诉操作 -->
            <template v-if="isLogin && isAdmin && l.type === 'banAppeal'">
              <Button size="small" @click="openAppealDealModal(l.id)" :disabled="l.appealStatus === 'accept'">
                {{ $t('detail.appeal.dealAppeal') }}
              </Button>
              <Divider type="vertical"/>
            </template>

            <Poptip width="400" transfer>
              <Button size="small" v-voice-button>
                <Icon type="md-share"/>
              </Button>
              <div slot="content">
                <Form :label-width="40" label-position="left">
                  <FormItem label="Url">
                    <Input :value="getShareFloor(l.id)" :autosize="{minRows: 2,maxRows: 2}" type="textarea"
                           readonly v-if="l.id"></Input>
                  </FormItem>
                  <FormItem label="Code">
                    <Input :value="`{floor:${l.id}}`" readonly v-if="l.id"></Input>
                  </FormItem>
                  <FormItem label="" v-if="l.id">
                    <Card dis-hover :padding="5">
                      <HtmlCore :html="`<p>{floor:${l.id}}</p>`" v-if="l.id"/>
                    </Card>
                  </FormItem>
                </Form>
              </div>
            </Poptip>
          </Col>
          <Col align="right" v-if="l.type !== 'historyUsername'">
            <span class="user-select-none"># </span><u><span style="opacity: .4">{{ l.id }}</span></u>
          </Col>
        </Row>

        <Divider v-if="index < timelineList.length - 1"></Divider>
      </TimelineItem>
      <!-- 时间轴 E -->
    </div>

    <br>

    <div align="center">
      <Page :page-size="timeline.limit"
            :current="timeline.page"
            :total="timeline.total"
            @on-change="handlePageChange"
            simple
            class="page"
            size="small"/>
      <br>
    </div>

    <Spin size="large" fix v-show="timeline.load">
      <Loading :size="50"></Loading>
    </Spin>
  </div>
</template>

<style scoped lang="less">
@import "@/assets/css/icon";
@import "@/assets/css/avatar.less";

.timeline-time {
  .avatar {
    padding: 0;
    margin-right: 5px;
  }
}

.timeline-view {
  position: relative;
}
</style>
