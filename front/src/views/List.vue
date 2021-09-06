<template>
  <div class="container">
    <div class="content">
      <br>
      <Breadcrumb>
        <BreadcrumbItem to="/">{{ $t("header.index") }}</BreadcrumbItem>
        <BreadcrumbItem>{{ $t("list.title") }}</BreadcrumbItem>
      </Breadcrumb>
      <br>

      <!--Filters:-->
      <!--状态checkbox、-->
      <!--创建时间（时间段）、-->
      <!--操作时间（时间段）、-->
      <!--id搜索-->

      <p>
        <RadioGroup
          size="large"
          class="game-type"
          v-model="gameName"
          @on-change="handleChanges"
          type="button">
          <Radio label="">
            {{ $t('list.filters.game.all') }}
          </Radio>
          <Radio label="bf1"
                 style="background-image: url('https://media.contentapi.ea.com/content/dam/gin/images/2017/01/battlefield-1-keyart-5452x3859.jpg.adapt.crop1x1.767p.jpg')">
            <Badge :count="getTotalNum('bf1')" :overflow-count="90000">
              <Tooltip :content="$t('list.filters.game.bf1')" placement="top-start">
                <img height="25" src="https://media.contentapi.ea.com/content/dam/gin/common/logos/layer-1.png">
              </Tooltip>
            </Badge>
          </Radio>
          <Radio label="bfv"
                 style="background-image: url('https://media.contentapi.ea.com/content/dam/gin/images/2018/05/bfv-campaignart-standard-large.jpg.adapt.crop1x1.767p.jpg')">
            <Badge :count="getTotalNum('bfv')" :overflow-count="90000">
              <Tooltip :content="$t('list.filters.game.bfv')" placement="top-start">
                <img height="25" src="https://media.contentapi.ea.com/content/dam/gin/common/logos/bfv-logo-white.png">
              </Tooltip>
            </Badge>
          </Radio>
          <Radio label="bf6"
                 style="background-image: url('https://media.contentapi.ea.com/content/dam/gin/images/2021/06/battlefield-2042-key-art.jpg.adapt.crop1x1.767p.jpg')">
            <Badge :count="getTotalNum('bf6')" :overflow-count="90000">
              <Tooltip :content="$t('list.filters.game.bf6')" placement="top-start">
                <img height="20"
                     src="https://media.contentapi.ea.com/content/dam/gin/common/logos/battlefield-2042-mono-logo-svg.svg">
              </Tooltip>
            </Badge>
          </Radio>
        </RadioGroup>
      </p>

      <Row :gutter="10">
        <Col span="17">
          <Card dis-hover class="list">
            <Page :page-size="limit" show-sizer show-total :current="page" @on-change="handlePageChange"
                  @on-page-size-change="handlePageSizeChange" :total="total" class="page" size="small"/>
            <Spin size="large" fix show-elevator v-show="spinShow"></Spin>
            <br>
            <ul>
              <!--          <li>-->
              <!--            <span><b>游戏ID</b></span>-->
              <!--            <span class="mobile-hide"><b>举报时间</b></span>-->
              <!--            <span><b>更新时间</b></span>-->
              <!--          </li>-->
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
                          :to="{name: 'cheater', params: { ouid: `${d.originPersonaId}.${d.originUserId}.${d.id}` }}">
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
            </ul>

            <Page :page-size="limit" show-sizer show-total :current="page" @on-change="handlePageChange"
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
                          style="width: 100px"></DatePicker>
              -
              <DatePicker :value="updateTime" type="daterange" @on-change="handleUDatepicker" split-panels
                          placeholder="更新时间范围"
                          style="width: 100px"></DatePicker>

              <Divider class="desktop-hide"></Divider>

              <Select class="desktop-hide" @on-change="handleChanges" v-model="statusGroup" style="width: 110px">
                <Option value="-1">{{ $t("list.filters.status.all") }}({{ getAllStatusNum }})</Option>
                <Option v-for="status in cheaterStatus" :value="status.value" :key="status.value">
                  {{ status.label }}({{ getStatusNum(status.value) }})
                </Option>
              </Select>

              <Divider></Divider>

              <Select @on-change="handleSortByChange" v-model="sortByValue" style="width:110px">
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
                  {{ status[$i18n.locale] }}
                </span>
                  </Badge>
                </Radio>
              </RadioGroup>
              <Divider type="vertical"/>

              <Button slot="extra" size="small" icon="ios-refresh" @click.prevent.stop="handleRefresh">
                {{ $t("list.filters.refresh") }}
              </Button>
            </Card>
          </Affix>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script>
import {http, api, conf} from '../assets/js/index'
import {getCheaterStatusLabel, cheaterStatus} from "@/mixins/common";
import ajax from "@/mixins/ajax";
import _ from "lodash";

//new ClipboardJS(".ivu-btn");

export default {
  data() {
    return {
      data: [],
      spinShow: true,
      gameName: "bf1",
      statusGroup: "",
      createTime: ["", ""],
      updateTime: ["", ""],
      page: 1,
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
      sortByValue: "updateDatetime",

      cheaterStatus: cheaterStatus,
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
    loadData() {
      // default values
      const {
        game = "bf1",
        status = -1,
        createTime = "",
        updateTime = "",
        page = 1,
        sort = "updateTime",
        limit = 10,
      } = this.$route.query;

      const config = {};

      config["params"] = Object.assign({
          game,
          page,
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
      this.page = Number.parseInt(page);
      this.limit = Number.parseInt(limit);
      this.sortByValue = sort;

      http.get(api['players'], config).then(({data: {data, total, sum, totalSum}}) => {
        this.spinShow = false;

        this.data = data.result;
        this.total = total;
        this.sum = sum;
        this.totalSum = totalSum;
      });
    },
    handleStatus: getCheaterStatusLabel,
    handleRefresh() {
      this.spinShow = true;

      this.loadData();
    },
    routerQuery() {
      const game = this.gameName;
      const status = this.statusGroup;
      const createTime = this.createTime.join(",");
      const updateTime = this.updateTime.join(",");
      const page = this.page;
      const limit = this.limit;
      const sort = this.sortByValue;

      let o = {};

      o["status"] = status;
      if (createTime !== ",") o["createTime"] = createTime;
      if (updateTime !== ",") o["updateTime"] = updateTime;
      if (page !== 1) o["page"] = page;
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
      this.page = 1;

      this.handleChanges();
    },
    handleCDatepicker(date) {
      this.cd = date;
      this.page = 1;

      this.handleChanges();
    },
    handleUDatepicker(date) {
      this.ud = date;
      this.page = 1;

      this.handleChanges();
    },
    handlePageChange(num) {
      this.page = num;
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
};
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
