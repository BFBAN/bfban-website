<template>
  <div>
    <div class="list-banner" :style="`background:linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 20%), linear-gradient(0deg, rgb(248 249 250) 0%, rgba(31, 31, 27, 0) 30%), linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url(${ games.filter(i => i.value == gameName)[0].bk_src })`">
    </div>

    <div class="container">
      <div class="content">
        <br>
        <Breadcrumb>
          <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem>{{ $t("list.title") }}</BreadcrumbItem>
        </Breadcrumb>
        <br>

        <!--Filters:-->
        <!--状态checkbox、-->
        <!--创建时间（时间段）、-->
        <!--操作时间（时间段）、-->
        <!--id搜索-->
        <Row>
          <Col flex="auto">
            <RadioGroup
                size="large"
                class="game-type"
                v-model="gameName"
                @on-change="handleChanges"
                type="button">
              <Radio label="">
                {{ $t('list.filters.game.all') }}
              </Radio>
              <Radio :label="i.value" :disabled="i.disabled" v-for="i in games" :key="i.value" :style="'background-image: url(' + i.bk_src + ')'">
                <Badge :count="getTotalNum('bf1')" :overflow-count="90000">
                  <Tooltip :content="$t('list.filters.game.' + i.value)" placement="top-start">
                    <img height="25" :src="i.logo_src" v-if="i.logo_src" />
                    <span v-else>{{i.full_name}}</span>
                  </Tooltip>
                </Badge>
              </Radio>
            </RadioGroup>
          </Col>
          <Col flex="auto">
            <i-switch v-model="bot.autoUpdate" @on-change="autoUpdateList"/>
            <Divider type="vertical"/>
            <Tooltip content="每隔设置时间刷新，有新的待审核桌面通知您" max-width="200">
              <Icon type="md-help-circle" />
            </Tooltip>
          </Col>
        </Row>

        <Row :gutter="10">
          <Col span="17">
            <Card dis-hover class="list">
              <Page :page-size="limit" show-sizer show-total :current="skip" @on-change="handlePageChange"
                    @on-page-size-change="handlePageSizeChange" :total="total" class="page" size="small"/>
              <Spin size="large" fix show-elevator v-show="spinShow"></Spin>
              <br>
              <ul>
                <div v-if="data.length > 0">
                  <div v-for="d in data" :key="d.originUserId">
                    <Card>
                      <Row>
                        <Col span="4">
                      <span style="display: flex; align-items: center;">
                        <Avatar :src="d.avatarLink || '//bfban-static.bamket.com/assets/images/avatar.png'"
                                alt="avatar"
                                size="55">
                        </Avatar>
                      </span>
                        </Col>
                        <Col span="15">
                          <div style="display: flex; flex-direction: column;">
                            <router-link
                                :to="{name: 'cheater', params: { ouid: `${d.originPersonaId}` }}">
                              <h2>
                                {{ d.originName }}
                                <Button size="small" type="text" icon="ios-copy-outline" :data-clipboard-text="d.originId"
                                        @click="copied"></Button>
                              </h2>
                            </router-link>
                          </div>

                          举报时间
                          <Time v-if="d.createTime" :time="d.createTime"/>
                          <Divider type="vertical"/>
                          更新时间
                          <Time v-if="d.updateTime" :time="d.updateTime"/>
                        </Col>
                        <Col span="5">
                          <Row type="flex" justify="center" align="middle" style="height: 50px">
                            <Col span="12" align="left" class="list">
                              <Icon type="md-eye" size="15" class="item-icon"/>
                              <span class="item-text">{{ d.viewNum || 0 }}</span>
                            </Col>
                            <Col span="1" align="center">
                              <Divider type="vertical"/>
                            </Col>
                            <Col span="11" align="right">
                              <Icon type="md-chatboxes" size="15" class="item-icon"/>
                              <span class="item-text">{{ d.commentsNum || 0 }}</span>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Card>
                    <br/>
                  </div>
                </div>
                <div v-else align="center">
                  (｀ﾍ´)=3 data null
                </div>
              </ul>

              <Page :page-size="limit" show-sizer show-total :current="skip" @on-change="handlePageChange"
                    @on-page-size-change="handlePageSizeChange" :total="total" class="page" size="small"/>
            </Card>
          </Col>
          <Col span="7">
            <br>
            <Affix :offset-top="20">
              <Card>
                <p slot="title">
                  {{ $t('list.colums.screenTitle') }}
                </p>

                <DatePicker :value="createTime" type="daterange" @on-change="handleCDatepicker" split-panels
                            placeholder="举报时间范围"
                            style="width: 110px"></DatePicker>
                -
                <DatePicker :value="updateTime" type="daterange" @on-change="handleUDatepicker" split-panels
                            placeholder="更新时间范围"
                            style="width: 110px"></DatePicker>

                <Divider class="desktop-hide"></Divider>

                <Select class="desktop-hide" @on-change="handleChanges" v-model="statusGroup" style="width: 110px">
                  <Option value="-1">{{ $t("list.filters.status.all") }}({{ getAllStatusNum }})</Option>
                  <Option v-for="status in cheaterStatus" :value="status.value" :key="status.value">
                    {{ status.label }}({{ getStatusNum(status.value) }})
                  </Option>
                </Select>

                <Divider></Divider>

                <Select @on-change="handleSortByChange" v-model="sortByValue">
                  <Option v-for="item in sortBy" :value="item.value" :key="item.value">
                    {{ $t(`list.filters.sortBy.${item.value}`) }}
                  </Option>
                </Select>

                <Divider></Divider>

                <RadioGroup
                    v-model="statusGroup"
                    @on-change="handleStatusChange"
                    type="button">
                  <Radio label="-1">
                    <Badge :count="getAllStatusNum" overflow-count="900000">
                      <span>{{ $t("list.filters.status.all") }}</span>
                    </Badge>
                  </Radio>
                  <Radio
                      v-for="status in cheaterStatus"
                      :key="status.value"
                      :label="`${status.value}`">
                    <Badge :count="getStatusNum(status.value)">
                    <span>
                      {{ $t(`basic.status[${status.value}]`) }}{{ status[$i18n.locale] }}
                    </span>
                    </Badge>
                  </Radio>
                </RadioGroup>
              </Card>
            </Affix>
          </Col>
        </Row>
      </div>
    </div>
  </div>
</template>

<script>
import BFBAN from "../assets/js/bfban";

import {http, api, util} from '../assets/js/index'
import _ from "lodash";

export default new BFBAN({
  data() {
    return {
      games: [],
      data: [],
      spinShow: true,
      gameName: "bf1",
      statusGroup: "",
      createTime: ["", ""],
      updateTime: ["", ""],
      skip: 1,
      limit: 10,
      total: 0,
      sum: [],
      totalSum: [],
      sortBy: [
        {value: "createTime",},
        {value: "updateTime",},
        {value: "viewNum",},
        {value: "commentNum",},
      ],
      sortByValue: "createTime",
      cheaterStatus: null,

      bot: {
        autoUpdate: false,
        time: 10000
      }
    };
  },
  created() {
    this.loadData();
  },
  watch: {
    $route: "loadData",

  },
  computed: {
    getAllStatusNum() {
      return _.sumBy(this.sum, (o) => {
        return o ? o.num : 0;
      });
    },
  },
  methods: {
    getCheaterStatusLabel: util.getCheaterStatusLabel,
    autoUpdateList () {
      const that = this;

      console.log(that.bot.autoUpdate)
      if (!that.bot.autoUpdate) {
        clearInterval(this.bot.fun);
        return;
      }

      that.bot.fun = setInterval(function () {
        that.getCheaterList();
      }, that.bot.time)
    },
    getTotalNum(val) {
      const target = _.find(this.totalSum, ["game", val]);

      return target ? target.num : 0;
    },
    getStatusNum(val) {
      const target = _.find(this.sum, ["status", val]);

      return target ? target.num : 0;
    },
    copied() {
      this.$Message.info("已复制");
    },
    async loadData() {
      await util.initUtil().then((res) => {
        this.cheaterStatus = res.cheaterStatus;

        this.games = res.gameName;
      });

      this.getCheaterList();
    },
    getCheaterList () {
      this.spinShow = true;

      // default values
      const {
        game = "bf1",
        status = -1,
        createTime = "",
        updateTime = "",
        skip = this.skip,
        sort = "updateTime",
        limit = this.limit,
      } = this.$route.query;

      const config = {};
      config["params"] = Object.assign({
            game,
            skip: (skip - 1) * limit,
            sort,
            status,
            tz: '', // moment.tz.gutter(),
            limit,
          },
          createTime ? {createTime: new Date(createTime).getTime(),} : {},
          updateTime ? {updateTime: new Date(updateTime).getTime(),} : {}
      );

      this.gameName = game;
      this.statusGroup = status;
      this.createTime = createTime.split(",");
      this.updateTime = updateTime.split(",");
      this.skip = Number.parseInt(skip);
      this.limit = Number.parseInt(limit);
      this.sortByValue = sort;

      http.get(api['players'], config).then(res => {
        const d = res.data;
        if (d.success == 1) {
          this.data = d.data.result || [];
          this.total = d.data.total;
          this.sum = d.data.sum;
          this.totalSum = d.data.totalSum;
        }
      }).catch((res) => {
        this.$Message.error(res.code);
      }).finally(() => {
        this.spinShow = false;
      });
    },
    // handleRefresh() {
    //   this.spinShow = true;
    //
    //   this.getCheaterList();
    // },
    routerQuery() {
      const game = this.gameName;
      const status = this.statusGroup;
      const createTime = this.createTime.join(",");
      const updateTime = this.updateTime.join(",");
      const skip = this.skip;
      const limit = this.limit;
      const sort = this.sortByValue;

      let o = {};

      o["status"] = status;
      if (createTime !== ",") o["createTime"] = createTime;
      if (updateTime !== ",") o["updateTime"] = updateTime;
      if (skip !== 1) o["skip"] = skip;
      o["limit"] = limit;
      if (sort !== "") o["sort"] = sort;
      if (game !== "") o["game"] = game;

      return o;
    },
    handleChanges() {
      this.spinShow = true;

      const query = this.routerQuery();

      this.$router.push({name: "cheaters", query});
    },
    handleStatusChange() {
      this.skip = 1;

      this.handleChanges();
    },
    handleCDatepicker(date) {
      this.cd = date;
      this.skip = 1;

      this.handleChanges();
    },
    handleUDatepicker(date) {
      this.ud = date;
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
    handleSortByChange(value) {
      this.handleChanges();
    },
  },
});
</script>

<style lang="scss" scoped>
li {
  display: flex;
  justify-content: space-around;
  border-bottom: 1px solid #eaeaea;
  padding: 0.4rem;
  align-items: center;

  &:nth-child(odd) {
    background-color: #eeeeee61;
  }

  span:nth-child(1) {
    flex-grow: 1;
    flex-shrink: 0;

    a {
      font-size: 1.2rem;
    }
  }

  span:nth-child(2) {
    flex-grow: 0;
    flex-shrink: 0;
    flex-basis: 25%;

    color: #6f6f6f;
  }

  span:nth-child(3) {
    flex-grow: 0;
    flex-shrink: 0;
    flex-basis: 25%;

    color: #6f6f6f;
  }
}

.page {
  padding: 0 16px;
  margin: 13px -16px;
  display: inline-block;
  width: calc(100% + 32px);
}

.list {
  margin: 20px 0;
  position: relative;

  .item-icon {
    margin: 0 10px;
  }
}

.game-type {
  label {
    animation: all .25s;
    background-size: cover;
    background-position: center;

    img {
      margin-top: 5px;
    }
  }

  label:hover {
    background-size: 100%;
  }
}
</style>

<style>

.list-banner {
  background-size: cover !important;
  background-repeat: no-repeat !important;
  opacity: .2;
  transform: scale(1.5);
  position: absolute;
  height: 800px;
  width: 100%;
}
</style>