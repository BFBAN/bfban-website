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
                {{ $t("basic.status.all") }}
              </Badge>
            </Radio>
            <Radio
                v-for="status in cheaterStatus"
                :key="status.value"
                :label="`${status.value}`">
              <Badge :count="getcHeaterStatusNum(status.value)" :overflow-count="900000" type="info">
                {{ $t(`basic.status[${status.value}]`) }}{{ status[$i18n.locale] }}
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
                  :total="total" />

            <Spin size="large" fix show-elevator v-show="spinShow"></Spin>

            <div v-for="(d, d_index) in data" :key="d.originUserId" class="item-card" v-voice-button>
              <Badge :text=" d.viewNum > 100 && d.commentsNum > 10 ? 'hot': ''" style="width: 100%">
                <Card dis-hover :padding="10">
                  <Row :gutter="10" type="flex">
                    <Col :xs="{span: 8, push: 0,pull:0}" :lg="{span: 3, push: 0,pull:0}">
                      <!-- 头像 S -->
                      <Avatar :src="d.avatarLink"
                              @on-error="onAvatarError(d_index)"
                              alt="avatar"
                              size="55"
                              v-if="d.avatarLink">
                      </Avatar>
                      <template v-else>
                        <Avatar icon="ios-person"
                                size="55"
                                style="background-color: rgba(255,0,0,0.37)"></Avatar>
                      </template>
                      <!-- 头像 E -->
                    </Col>
                    <Col :xs="{span: 17, push: 0,pull:0}" :lg="{span: 17, push: 0,pull:0}">
                      <div style="display: flex; flex-direction: column;">
                        <Tooltip :content="$t('list.colums.playerId')">
                          <h2>
                            <router-link :to="{name: 'player', params: { ouid: `${d.originPersonaId}` }}"
                                         :style="d.avatarLink == '' ? 'color: rgba(255,0,0,1);text-decoration: line-through;' : ''">
                              {{ d.originName }}
                            </router-link>
                          </h2>
                        </Tooltip>
                      </div>

                      <div>
                        {{ $t('list.colums.reportTime') }}
                        <Time v-if="d.createTime" :time="d.createTime"/>
                        <Divider type="vertical"/>
                        {{ $t('list.colums.updateTime') }}
                        <Time v-if="d.updateTime" :time="d.updateTime"/>
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
              (｀ﾍ´)=3=3=3=3=3=3
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
        </Col>
        <Col :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 7, push: 0, pull: 0}">
          <br>
          <Affix :offset-top="20">
            <Card>
              <p slot="title">
                <Icon type="md-funnel" /> {{ $t('list.colums.screenTitle') }}
              </p>

              <Form>
                <FormItem :label="$t('list.reportTime')">
                  <DatePicker :value="createTime" @on-change="handleCDatepicker" split-panels
                              :placeholder="$t('list.reportTime')" style="width: 100%"></DatePicker>
                </FormItem>
                <FormItem :label="$t('list.updateTime')">
                  <DatePicker :value="updateTime" @on-change="handleUDatepicker" split-panels
                              :placeholder="$t('list.updateTime')" style="width: 100%"></DatePicker>
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
import BFBAN from "../assets/js/bfban";

import {account_storage, api, http, util} from '../assets/js/index'
import cheaterStatus from '/public/conf/cheaterStatus.json'
import gameName from '/public/conf/gameName.json'
import _ from "lodash";

export default new BFBAN({
  data() {
    return {
      games: [],
      data: [],
      spinShow: true,
      gameName: "all",
      statusGroup: "-1",
      createTime: "",
      updateTime: "",
      skip: 1,
      limit: 10,
      total: 0,
      gameSum: [],
      totalSum: [],
      sortBy: [
        {value: "createTime",},
        {value: "updateTime",},
        {value: "viewNum",},
        {value: "commentNum",},
      ],
      sortByValue: "createTime",
      cheaterStatus: null,
    };
  },
  created() {
    this.loadData();
  },
  watch: {
    $route: "loadData",
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
      await util.initUtil().then((res) => {
        this.cheaterStatus = res.cheaterStatus;

        this.games = res.gameName;
      });

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
            totalSum.push({status: that.cheaterStatus.filter(item => item.value == i.status)[0].value, num: Number(i.count)})
          });
          this.totalSum = totalSum;
        }
      }).catch((res) => {
        this.$Message.error(res.message);
      })
    },
    /**
     * 取得作弊玩家列表
     */
    async getCheaterList() {
      // default values
      const {game = "all", status = -1, createTime, updateTime, skip = this.skip, sort = "updateTime", limit = this.limit} = this.$route.query;

      let config = {
        params: {
          game,
          skip: (skip - 1) * limit,
          sort,
          status,
          tz: '',
          limit,
        },
      };

      if (createTime) {
          config["params"]["createTime"] = new Date(createTime).getTime();
      }

      if (updateTime) {
          config["params"]["updateTime"] = new Date(updateTime).getTime();
      }

      // 设置筛选参
      // 更新widget对应选择器的值
      this.gameName = game;
      this.statusGroup = status;
      this.createTime = createTime;
      this.updateTime = updateTime;
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
      const _createTime = this.createTime;
      const _updateTime = this.updateTime;
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
    onAvatarError (index) {
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
@import "./src/assets/css/radio.less";

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