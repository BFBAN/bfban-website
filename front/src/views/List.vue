<template>
  <div class="container">
    <div class="content">
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
          <Radio label="bf1" style="background-image: url('https://media.contentapi.ea.com/content/dam/gin/images/2017/01/battlefield-1-keyart-5452x3859.jpg.adapt.crop1x1.767p.jpg')">
            <Badge :count="getTotalNum('bf1')" :overflow-count="90000">
              <Tooltip :content="$t('list.filters.game.bf1')" placement="top-start">
                <img height="25" src="https://media.contentapi.ea.com/content/dam/gin/common/logos/layer-1.png">
              </Tooltip>
            </Badge>
          </Radio>
          <Radio label="bfv" style="background-image: url('https://media.contentapi.ea.com/content/dam/gin/images/2018/05/bfv-campaignart-standard-large.jpg.adapt.crop1x1.767p.jpg')">
            <Badge :count="getTotalNum('bfv')" :overflow-count="90000">
              <Tooltip :content="$t('list.filters.game.bfv')" placement="top-start">
                <img height="25" src="https://media.contentapi.ea.com/content/dam/gin/common/logos/bfv-logo-white.png">
              </Tooltip>
            </Badge>
          </Radio>
          <Radio label="bf6" style="background-image: url('https://media.contentapi.ea.com/content/dam/gin/images/2021/06/battlefield-2042-key-art.jpg.adapt.crop1x1.767p.jpg')">
            <Badge :count="getTotalNum('bf6')" :overflow-count="90000">
              <Tooltip :content="$t('list.filters.game.bf6')" placement="top-start">
                <img height="20" src="https://media.contentapi.ea.com/content/dam/gin/common/logos/battlefield-2042-mono-logo-svg.svg">
              </Tooltip>
            </Badge>
          </Radio>
        </RadioGroup>
        <Divider type="vertical"/>
        <span class="mobile-hide">
          <DatePicker :value="cd" type="daterange" @on-change="handleCDatepicker" split-panels placeholder="举报时间范围"
                      style="width: 200px"></DatePicker>
          -
          <DatePicker :value="ud" type="daterange" @on-change="handleUDatepicker" split-panels placeholder="更新时间范围"
                      style="width: 200px"></DatePicker>
        </span>
        <Select class="desktop-hide" @on-change="handleChanges" v-model="statusGroup" style="width: 110px">
          <Option value="100">{{ $t("list.filters.status.all") }}({{ getAllStatusNum }})</Option>
          <Option v-for="status in cheaterStatus" :value="status.value" :key="status.value">
            {{ status.label }}({{ getStatusNum(status.value) }})
          </Option>
        </Select>
        <Divider type="vertical"/>
        <Select @on-change="handleSortByChange" v-model="sortByValue" style="width:110px">
          <Option v-for="item in sortBy" :value="item.value" :key="item.value">{{ item.value }}</Option>
        </Select>
      </p>
      <br>
      <p class="mobile-hide">
        <RadioGroup
          v-model="statusGroup"
          @on-change="handleStatusChange"
          type="button">
          <Radio label="100">
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
        <Button icon="ios-refresh" @click.prevent.stop="handleRefresh">{{ $t("list.filters.refresh") }}
        </Button>
      </p>

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
                <Col span="2">
                  <span style="display: flex; align-items: center;">
                    <img :src="d.avatarLink || '//bfban-static.bamket.com/assets/images/avatar.png'" alt="avatar"
                         style="
                      width: 3rem;
                      height: 3rem;
                      border-radius: 2.3rem;">
                  </span>
                </Col>
                <Col span="18">
                  <div style="display: flex; flex-direction: column;">
                    <div style="height: 1.6rem;">
                      <router-link :to="{name: 'cheater', params: {ouid: `${d.originUserId}` }}">
                        <h2>
                          {{ d.originId }}
                          <Button size="small" type="text" icon="ios-copy-outline" :data-clipboard-text="d.originId"
                                  @click="copied"></Button>
                        </h2>
                      </router-link>
                    </div>
                  </div>

                  举报时间
                  <Time v-if="d.createDatetime" :time="d.createDatetime"/>
                  <Divider type="vertical"/>
                  更新时间
                  <Time v-if="d.updateDatetime" :time="d.updateDatetime"/>
                </Col>
                <Col span="3">
                  <Row type="flex" justify="center" align="middle" style="height: 50px">
                    <Col span="12" align="center" class="list">
                      <Icon type="md-eye" size="15" class="item-icon"/>
                      <span class="item-text">{{ d.n }}</span>
                    </Col>
                    <Col span="1" align="center">
                      <Divider type="vertical"/>
                    </Col>
                    <Col span="10" align="center">
                      <Icon type="md-chatboxes" size="15" class="item-icon"/>
                      <span class="item-text">{{ d.commentsNum }}</span>
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
    </div>
  </div>
</template>

<script>
import {getCheaterStatusLabel, cheaterStatus} from "@/mixins/common";
import ajax from "@/mixins/ajax";
import _ from "lodash";

function moment() {
}

//new ClipboardJS(".ivu-btn");

export default {
  data() {
    return {
      data: [],
      spinShow: true,
      gameName: "bf1",
      statusGroup: "",
      cd: ["", ""],
      ud: ["", ""],
      page: 1,
      limit: 10,
      total: 0,
      sum: [],
      totalSum: [],

      sortBy: [
        {
          value: "createDatetime",
          "zh-CN": "举报时间倒序",
          "en-US": "Report time",
          "ja-JP": "時間を逆の順序で報告します",
        },
        {
          value: "updateDatetime",
          "zh-CN": "更新时间倒序",
          "en-US": "Update time",
          "ja-JP": "逆更新時間",
        },
        {
          value: "n",
          "zh-CN": "围观次数倒序",
          "en-US": "Number of viewers",
          "ja-JP": "逆順の見物人",
        },
        {
          value: "commentsNum",
          "zh-CN": "回复次数倒序",
          "en-US": "Number of replies",
          "ja-JP": "返信数を逆にする",
        },
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
        status = "100",
        cd = "",
        ud = "",
        page = 1,
        sort = "updateDatetime",
        limit = 10,
      } = this.$route.query;

      const config = {
        method: "get",
        url: "/cheaters/",
      };

      config["params"] = {
        game,
        status,
        cd,
        ud,
        page,
        sort,
        tz: '', // moment.tz.gutter(),
        limit,
      };
      this.gameName = game;
      this.statusGroup = status;
      this.cd = cd.split(",");
      this.ud = ud.split(",");
      this.page = Number.parseInt(page);
      this.limit = Number.parseInt(limit);
      this.sortByValue = sort;

      ajax(config).then(({data: {data, total, sum, totalSum}}) => {
        this.spinShow = false;

        this.data = data;
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
      const cd = this.cd.join(",");
      const ud = this.ud.join(",");
      const page = this.page;
      const limit = this.limit;
      const sort = this.sortByValue;

      let o = {};

      o["status"] = status;
      if (cd !== ",") o["cd"] = cd;
      if (ud !== ",") o["ud"] = ud;
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
