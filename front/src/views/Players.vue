<template>
  <div class="container">
    <div class="content">
      <br>
      <Row>
        <Col :xs="{push: 1}" :lg="{push: 0}">
          <Breadcrumb>
            <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
            <BreadcrumbItem>{{ $t("list.title") }}</BreadcrumbItem>
          </Breadcrumb>
        </Col>
      </Row>
      <br>

      <!-- 游戏类型选择 S -->
      <Row>
        <Col flex="auto" :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 24, push: 0, pull: 0}">
          <RadioGroup
              v-voice-button
              size="large"
              class="game-type"
              v-model="gameName"
              @on-change="handleChanges"
              type="button">
            <Radio label="all" value="all">
              <Badge :count="getTotalNum('*')" :overflow-count="90000" type="normal">
                {{ $t('basic.games.all') }}
              </Badge>
            </Radio>
            <Radio :label="i.value" :disabled="i.disabled" v-for="i in games" :key="i.value" aria-radio
                   :style="'background-image: url(' + require('/src/assets/' + i.bk_file + '/bf.jpg') + ');'"
                   :class="gameName == i.value ? 'gametype-select' : ''">
              <Badge :count="getTotalNum(i.value)" :overflow-count="90000" type="info">
                <Tooltip :content="$t('basic.games.' + i.value)" placement="top-start">
                  <img height="35" :src="require('/src/assets/' + i.bk_file + '/logo.png')" v-if="i.logo_src"/>
                  <span v-else>{{ i.full_name }}</span>
                </Tooltip>
              </Badge>
            </Radio>
          </RadioGroup>
        </Col>
        <Col v-if="isLogin" class="mobile-hide">
          <router-link :to="{name: 'profile', params: {pagename: 'voice'}}">
            <Button type="text" shape="circle">
              <Icon type="md-musical-notes" size="20"/>
            </Button>
          </router-link>
        </Col>
      </Row>
      <!-- 游戏类型选择 E -->

      <!-- 状态类型 S -->
      <Row>
        <Col :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 24, push: 0, pull: 0}">
          <RadioGroup
              v-voice-button
              style="margin-top: 12px"
              v-model="statusGroup"
              @on-change="handleStatusChange"
              type="button">
            <Radio label="-1">
              <Badge :overflow-count="900000"
                     size="small"
                     type="info">
                {{ $t("basic.status.all.text") }}
              </Badge>
            </Radio>
            <Radio
                v-for="status in cheaterStatus"
                :key="status.value"
                :label="`${status.value}`">
              <Badge :count="getcHeaterStatusNum(status.value)" :overflow-count="900000" type="info">
                {{ $t(`basic.status[${status.value}].text`) }}{{ status[$i18n.locale] }}
              </Badge>
            </Radio>
          </RadioGroup>
        </Col>
      </Row>
      <!-- 状态类型 E -->

      <Row :gutter="10">
        <Col :xs="{span: 24, push: 0, pull: 0}" :lg="{span: 17, push: 0, pull: 0}">
          <Card dis-hover class="list">
            <Page class="page"
                  size="small"
                  show-sizer
                  show-total
                  show-elevator
                  @on-change="handlePageChange"
                  @on-page-size-change="handlePageSizeChange"
                  :page-size="limit"
                  :current="skip"
                  :total="total"/>

            <Spin size="large" fix show-elevator v-show="spinShow"></Spin>

            <AdsGoogle id="7930151828" style="margin-bottom: 8px;"></AdsGoogle>

            <div v-for="(d, d_index) in data" :key="d.originUserId" class="item-card" v-voice-button>
              <Badge :text=" d.viewNum > 100 && d.commentsNum > 10 ? 'hot': ''" style="width: 100%">
                <Card dis-hover :padding="10">
                  <Row :gutter="10" type="flex">
                    <Col :xs="{span: 5, push: 0,pull:0}" :lg="{span: 3, push: 0,pull:0}">
                      <!-- 头像 S -->
                      <Avatar :src="d.avatarLink"
                              class="default-avatar"
                              @on-error="onAvatarError(d_index)"
                              alt="avatar"
                              size="55"
                              v-if="d.avatarLink">
                      </Avatar>
                      <!-- 头像 E -->
                    </Col>
                    <Col :xs="{span: 18, push: 0,pull:0}" :lg="{span: 17, push: 0,pull:0}">
                      <div style="display: flex; flex-direction: column;">
                        <Tooltip :content="$t('list.colums.playerId')">
                          <h2 class="text-distinguishing-letter">
                            <router-link :to="{name: 'player', params: { ouid: `${d.originPersonaId}` }}"
                                         :style="d.avatarLink == '' ? 'color: rgba(255,0,0,1);text-decoration: line-through;' : ''">
                              <code>{{ d.originName }}</code>
                            </router-link>
                          </h2>
                        </Tooltip>
                      </div>

                      <div>
                        {{ $t('list.colums.reportTime') }}
                        <TimeView :time="d.createTime">
                          <Time v-if="d.createTime" :time="d.createTime" type="datetime"/>
                        </TimeView>
                        <Divider type="vertical"/>
                        {{ $t('list.colums.updateTime') }}
                        <TimeView :time="d.updateTime">
                          <Time v-if="d.updateTime" :time="d.updateTime"/>
                        </TimeView>
                      </div>
                    </Col>
                    <Col :xs="{span: 24, push: 0,pull:0}" :lg="{span: 3, push: 0,pull:0}" class="mobile-hide">
                      <Row type="flex" justify="end" align="middle" style="height: 100%">
                        <Col flex="auto" align="right" class="item-text">
                          <span>{{ d.viewNum || 0 }}</span>
                          <Icon type="md-eye" size="17" class="item-icon"/>
                        </Col>
                        <Col flex="auto" align="right" class="item-text">
                          <span>{{ d.commentsNum || 0 }}</span>
                          <Icon type="md-chatboxes" size="17" class="item-icon"/>
                        </Col>
                      </Row>
                    </Col>
                    <Col :xs="{span: 24, push: 0,pull:0}" :lg="{span: 1, push: 0,pull:0}"
                         align="center"
                         class="mobile-hide">
                      <Progress vertical :percent="d.status == 1 ? 99 : 100" hide-info status="wrong"/>
                    </Col>
                  </Row>
                </Card>
              </Badge>
            </div>
            <Card dis-hover :padding="10" v-if="data.length <= 0" align="center">
              <Empty></Empty>
            </Card>

            <Page class="page"
                  size="small"
                  show-sizer
                  show-total
                  show-elevator
                  :page-size="limit"
                  :current="skip"
                  :total="total"
                  @on-change="handlePageChange"
                  @on-page-size-change="handlePageSizeChange"/>
          </Card>

          <AdsGoogle id="6674125493" style="margin: 10px 0;"></AdsGoogle>
        </Col>
        <Col :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 7, push: 0, pull: 0}">
          <br>
          <AdsGoogle id="1760339032"></AdsGoogle>

          <Affix :offset-top="20">
            <Card dis-hover>
              <p slot="title">
                <Icon type="md-funnel"/>
                {{ $t('list.colums.screenTitle') }}
              </p>

              <Form>
                <FormItem :label="$t('list.reportTime')">
                  <DatePicker type="daterange"
                              placement="bottom-end"
                              split-panels
                              @on-change="handleCDatepicker"
                              :options="timeOptions"
                              :value="createTime"
                              :placeholder="$t('list.reportTime')"
                              style="width: 100%"></DatePicker>
                </FormItem>
                <FormItem :label="$t('list.updateTime')">
                  <DatePicker type="daterange"
                              placement="bottom-end"
                              split-panels
                              @on-change="handleUDatepicker"
                              :options="timeOptions"
                              :value="updateTime"
                              :placeholder="$t('list.updateTime')"
                              style="width: 100%"></DatePicker>
                </FormItem>
                <FormItem>
                  <Select @on-change="handleChanges" v-model="sortByValue">
                    <Option v-for="item in sortBy" :value="item.value" :key="item.value">
                      {{ $t(`list.filters.sortBy.${item.value}`) }}
                    </Option>
                  </Select>
                </FormItem>
              </Form>
            </Card>
          </Affix>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script>
import {api, http, util, voice} from '../assets/js/index';

import cheaterStatus from '/public/config/cheaterStatus.json';
import gameName from '/public/config/gameName.json';

import Application from "../assets/js/application";
import Empty from "@/components/Empty";
import AdsGoogle from "@/components/ads/google/index.vue";
import TimeView from "@/components/TimeView.vue";
import _ from "lodash";
import store from "@/store";

export default new Application({
  data() {
    return {
      games: [],
      data: [],
      spinShow: true,
      gameName: "all",
      statusGroup: "-1",
      timeOptions: {
        disabledDate(date) {
          return date && date.valueOf() > Date.now();
        },
        shortcuts: [
          {
            text: this.$i18n.t('sitestats.timeRange.daily'),
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24);
              return [start, end];
            }
          },
          {
            text: this.$i18n.t('sitestats.timeRange.weekly'),
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              return [start, end];
            }
          },
          {
            text: this.$i18n.t('sitestats.timeRange.monthly'),
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              return [start, end];
            }
          },
          {
            text: this.$i18n.t('sitestats.timeRange.yearly'),
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30 * 12);
              return [start, end];
            }
          }
        ]
      },
      createTime: [],
      updateTime: [],
      skip: 1,
      limit: 20,
      total: 0,
      gameSum: [],
      totalSum: [],
      sortBy: [
        {value: "createTime",},
        {value: "updateTime",},
        {value: "viewNum",},
        {value: "commentsNum",},
      ],
      sortByValue: "createTime",
      cheaterStatus: null,
    };
  },
  components: {Empty, AdsGoogle, TimeView},
  watch: {
    $route: "loadData",
    gameName: function (val, oldVal) {
      if (val &&
          val != 'all' &&
          store.state.configuration.voice &&
          store.state.configuration['voice_backgroundMusic'].state
      ) {
        voice.onStopAll();
        setTimeout(function () {
          voice.play(val);
        }, 800)
      }
    }
  },
  created() {
    this.loadData();
  },
  methods: {
    /**
     * 游戏数量统计
     */
    getTotalNum(val) {
      let target = {};
      switch (val) {
        case '*':
          // 总数
          this.gameSum.forEach(i => {
            return target.num += (i.count);
          });
          break;
        default:
          target = _.find(this.gameSum, ["game", val]);
      }
      return target ? target.num : 0;
    },
    getcHeaterStatusNum(val) {
      let target = _.find(this.totalSum, ["status", val]);
      return target ? target.num : 0;
    },
    /**
     * 加载数据
     * @returns {Promise<void>}
     */
    async loadData() {
      await util.initUtil().then(res => {
        this.cheaterStatus = res.cheaterStatus;

        this.games = res.gameName;
      });

      const backgroundMusic = store.state.configuration['voice_backgroundMusic'];
      voice.addVoice('bf1', voice.voiceData({
        src: [require('@/assets/voice/bf1_mian_theme.mp3')],
        volume: (backgroundMusic && backgroundMusic.value) || 1,
        pool: true
      }))
      voice.addVoice('bfv', voice.voiceData({
        src: [require('@/assets/voice/bfv_mian_theme.mp3')],
        volume: (backgroundMusic && backgroundMusic.value) || 1,
        pool: true
      }))
      voice.addVoice('bf6', voice.voiceData({
        src: [require('@/assets/voice/bf2042_mian_theme.mp3')],
        volume: (backgroundMusic && backgroundMusic.value) || 1,
        pool: true
      }))

      this.getCheaterList();
      this.getPlayerStatistics();
    },
    /**
     * 取得数量统计
     */
    getPlayerStatistics() {
      const that = this;
      let data = {
        data: []
      };
      let splitIndex = 0;

      gameName.child.forEach(i => {
        data.data.push({"game": i.value, "status": -1});
        splitIndex++;
      });

      cheaterStatus.child.forEach((i, index) => {
        data.data.push({"game": this.gameName == 'all' ? '*' : this.gameName, "status": i.value})
      });

      http.post(api['playerStatistics'], {
        data,
      }).then(res => {
        const d = res.data;
        let gameSum = [];
        let totalSum = [];

        if (d.success === 1) {
          // game Type
          [].concat(d.data).splice(0, splitIndex).forEach((i, index) => {
            gameSum.push({game: that.games[index].value.toString(), num: Number(i.count)})
          });
          this.gameSum = gameSum;

          // type methods
          [].concat(d.data).splice(splitIndex, d.data.length - 1).forEach((i, index) => {
            totalSum.push({
              status: that.cheaterStatus.filter(item => item.value == i.status)[0].value,
              num: Number(i.count)
            })
          });
          this.totalSum = totalSum;
        }
      }).catch(res => {
        this.$Message.error(res.message);
      })
    },
    /**
     * 取得作弊玩家列表
     */
    async getCheaterList() {
      // default values
      const {
        game = "all",
        status = -1,
        createTime,
        updateTime,
        skip = this.skip,
        sort = "updateTime",
        limit = this.limit
      } = this.$route.query;

      let config = {
        params: {
          game,
          skip: (skip - 1) * limit,
          sortBy: sort,
          status,
          limit,
        },
      };

      if (createTime) {
        const _time = createTime.split(",");
        const _startTime = new Date(_time[0]).getTime();
        const _endTime = new Date(_time[1]).getTime();

        config["params"]["createTimeFrom"] = _startTime;
        config["params"]["createTimeTo"] = _endTime;
      }

      if (updateTime) {
        const _time = updateTime.split(",");
        const _startTime = new Date(_time[0]).getTime();
        const _endTime = new Date(_time[1]).getTime();

        config["params"]["updateTimeFrom"] = _startTime;
        config["params"]["updateTimeTo"] = _endTime;
      }

      // 设置筛选参
      // 更新widget对应选择器的值
      this.gameName = game;
      this.statusGroup = status;
      if (createTime) this.createTime = createTime.split(",");
      if (updateTime) this.updateTime = updateTime.split(",");
      this.skip = Number.parseInt(skip);
      this.limit = Number.parseInt(limit);
      this.sortByValue = sort;

      this.spinShow = true;

      return new Promise((resolve, reject) => {
        http.get(api['players'], config).then(res => {
          const d = res.data;

          if (d.success === 1) {
            this.data = d.data.result || [];
            this.total = d.data.total;

            resolve(d);
          } else {
            this.catch(res);
          }
        }).catch((err) => {
          this.$Message.error(err.code);
          reject(err);
        }).finally(() => {
          this.spinShow = false;
        });
      })
    },
    routerQuery() {
      const _game = this.gameName;
      const _status = this.statusGroup;
      const _createTime = this.createTime ? this.createTime.toString() : '';
      const _updateTime = this.updateTime ? this.updateTime.toString() : '';
      const _skip = this.skip;
      const _limit = this.limit;
      const _sort = this.sortByValue;

      let o = {};

      o["status"] = _status;
      if (_createTime !== ",") o["createTime"] = _createTime;
      if (_updateTime !== ",") o["updateTime"] = _updateTime;
      if (_skip !== 1) o["skip"] = _skip;
      o["limit"] = _limit;
      if (_sort !== "") o["sort"] = _sort;
      if (_game !== "") o["game"] = _game;

      return o;
    },
    handleChanges() {
      const query = this.routerQuery();

      this.$router.push({
        name: this.$router.name,
        query
      });
    },
    handleStatusChange() {
      this.skip = 1;

      this.handleChanges();
    },
    handleCDatepicker(date) {
      this.createTime = date;
      this.skip = 1;

      this.handleChanges();
    },
    handleUDatepicker(date) {
      this.updateTime = date;
      this.skip = 1;

      this.handleChanges();
    },
    handlePageChange(num) {
      this.skip = num;

      this.handleChanges();
    },
    handlePageSizeChange(num) {
      this.limit = num;
      this.handleChanges();
    },
    onAvatarError(index) {
      this.data[index].avatarLink = ""
    }
  },
  computed: {
    getAllStatusNum() {
      let target = {num: 0};
      switch (this.gameName) {
        case 'all':
          for (let i of this.gameSum)
            target.num += i.num || 0;
          break;
        default:
          target = _.find(this.gameSum, ["game", this.gameName]);
      }
      return target ? target.num : 0;
    },
  },
});
</script>

<style lang="less" scoped>
@import "@/assets/css/radio.less";
@import "@/assets/css/avatar.less";

.page {
  padding: 0 16px;
  margin: 13px -16px;
  display: inline-block;
  width: calc(100% + 32px);
}

.list {
  margin: 20px 0 0 0;
  position: relative;

  .item-card {
    margin-bottom: 10px;
  }

  .item-text {
    white-space: nowrap;
    font-size: 12px;
    font-weight: 400;
  }

  .item-icon {
    margin: 0 20px 0 5px;
  }
}
</style>
