<template>
  <div class="container">
    <div class="content">
      <Divider>{{$t("list.title")}}</Divider>

      <!--Filters:-->
      <!--状态checkbox、-->
      <!--创建时间（时间段）、-->
      <!--操作时间（时间段）、-->
      <!--id搜索-->

      <p>
        <RadioGroup v-model="gameName" @on-change="handleChanges" type="button">
          <Radio label="bf1"><span>{{$t("list.filters.game.bf1")}}({{getTotalNum('bf1')}})</span></Radio>
          <Radio label="bfv"><span>{{$t("list.filters.game.bfv")}}({{getTotalNum('bfv')}})</span></Radio>
        </RadioGroup>
      </p>
      <p class="mobile-hide">
        <RadioGroup v-model="statusGroup" @on-change="handleStatusChange" type="button">
          <Radio label="100"><span>{{$t("list.filters.status.all")}}({{getAllStatusNum}})</span></Radio>
          <Radio v-for="status in cheaterStatus" :key="status.value" :label="`${status.value}`">
            <span>{{ status.label }}({{ getStatusNum(status.value)}})</span>
          </Radio>
        </RadioGroup>
      </p>


      <p>
        <span class="mobile-hide">
          <DatePicker :value="cd" type="daterange" @on-change="handleCDatepicker" split-panels placeholder="举报时间范围" style="width: 200px"></DatePicker>
          <DatePicker :value="ud" type="daterange" @on-change="handleUDatepicker" split-panels placeholder="更新时间范围" style="width: 200px"></DatePicker>
        </span>

        <Select class="desktop-hide" @on-change="handleChanges" v-model="statusGroup" style="width: 110px">
          <Option value="100">{{$t("list.filters.status.all")}}({{getAllStatusNum}})</Option>
          <Option v-for="status in cheaterStatus" :value="status.value" :key="status.value">{{ status.label }}({{ getStatusNum(status.value)}})</Option>
        </Select>

        <Select @on-change="handleSortByChange" v-model="sortByValue" style="width:110px">
          <Option v-for="item in sortBy" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
      </p>

      <p>
        <Button icon="ios-refresh" @click.prevent.stop="handleRefresh">{{$t("list.filters.refresh")}}</Button>
      </p>


      <div class="list">
        <Page :page-size="limit" show-sizer show-total :current="page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" :total="total" class="page" size="small" />

        <ul>
          <li>
            <span><b>游戏ID</b></span>
            <span class="mobile-hide"><b>举报时间</b></span>
            <span><b>更新时间</b></span>
          </li>
          <li v-for="d in data" :key="d.originUserId">
          <span style="display: flex; align-items: center;">
            <img :src="d.avatarLink || '//bfban-static.bamket.com/assets/images/avatar.png'" alt="avatar" style="width: 2.3rem;
            height: 2.3rem;
            border-radius: 2.3rem;
            margin-right: .4rem;">
            <div style="display: flex; flex-direction: column;">
              <div style="height: 1.6rem;">
                <router-link :to="{name: 'cheater', params: {ouid: `${d.originUserId}` }}">{{d.originId}}</router-link>
                <Button size="small" type="text" icon="ios-copy-outline" :data-clipboard-text="d.originId" @click="copied"></Button>
              </div>
              <span>
              <Icon type="md-eye" /> {{ d.n }}
              <Icon type="md-chatboxes" /> {{ d.commentsNum }}
            </span>
            </div>


          </span>
          <span class="mobile-hide">
            <Time v-if="d.createDatetime" :time="d.createDatetime" />
          </span>
          <span>
            <Time v-if="d.updateDatetime" :time="d.updateDatetime" />
          </span>
          </li>
        </ul>

        <Page :page-size="limit" show-sizer show-total :current="page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" :total="total" class="page" size="small" />
        <Spin size="large" fix v-show="spinShow"></Spin>
      </div>
    </div>
  </div>

</template>

<script>
import { getCheaterStatusLabel, cheaterStatus } from '@/mixins/common';
import ajax from '@/mixins/ajax'

new ClipboardJS('.ivu-btn');

export default {
  data() {
    return {
      data: [
      ],
      spinShow: true,
      gameName: 'bf1',
      statusGroup: '',
      cd: ['', ''],
      ud: ['', ''],
      page: 1,
      limit: 20,
      total: 0,
      sum: [],
      totalSum: [],

      sortBy: [
        {
          value: 'createDatetime',
          label: '举报时间倒序',
        },
        {
          value: 'updateDatetime',
          label: '更新时间倒序',
        },
        {
          value: 'n',
          label: '围观次数倒序',
        },
        {
          value: 'commentsNum',
          label: '回复次数倒序',
        },
      ],
      sortByValue: 'updateDatetime',

      cheaterStatus: cheaterStatus,
    }
  },
  created() {
    this.loadData();
  },
  watch: {
    '$route': 'loadData',
  },
  computed: {
    getAllStatusNum() {
      return _.sumBy(this.sum, (o) => {
        return o ? o.num : 0;
      })
    },
  },
  methods: {
    getTotalNum(val) {
      const target = _.find(this.totalSum, ['game', val]);

      return target ? target.num : 0;
    },
    getStatusNum(val) {
      const target = _.find(this.sum, ['status', val]);

      return target ? target.num : 0;
    },
    copied() {
      this.$Message.info('已复制');
    },
    loadData() {
      // default values
      const { game = 'bf1', status = '100', cd = '', ud = '', page = 1, sort='updateDatetime', limit = 40 } = this.$route.query;

      const config = {
        method: 'get',
        url: '/cheaters/',
      };

      config['params'] = {
        game,
        status,
        cd,
        ud,
        page,
        sort,
        tz: moment.tz.guess(),
        limit
      };
      this.gameName = game;
      this.statusGroup = status;
      this.cd = cd.split(',');
      this.ud = ud.split(',');
      this.page = Number.parseInt(page);
      this.limit = Number.parseInt(limit);
      this.sortByValue = sort;

      ajax(config)
      .then(({data: {data, total, sum, totalSum}}) => {
        this.spinShow = false;

        this.data = data;
        this.total = total;
        this.sum = sum;
        this.totalSum = totalSum;

      })
    },
    handleStatus: getCheaterStatusLabel,
    handleRefresh() {
      this.spinShow = true;

      this.loadData();
    },
    routerQuery() {
      const game = this.gameName;
      const status = this.statusGroup;
      const cd = this.cd.join(',');
      const ud = this.ud.join(',');
      const page = this.page;
      const limit = this.limit;
      const sort = this.sortByValue;

      let o = {};

      o['status'] = status;
      if (cd !== ',') o['cd'] = cd;
      if (ud !== ',') o['ud'] = ud;
      if (page !== 1) o['page'] = page;
      if (limit !== 20) o['limit'] = limit;
      if (sort !== '') o['sort'] = sort;
      if (game !== '') o['game'] = game;

      return o;
    },
    handleChanges() {
      this.spinShow = true;

      const query = this.routerQuery();

      this.$router.push({name: 'cheaters', query});
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

    convertCheatMethods(str) {

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
      return str.split(',').map((v, i) => {
        return list[v]
      }).join(' ');
    },
    handleSortByChange(value) {
      this.handleChanges();
    },
  }
}
</script>

<style lang="scss" scoped>
  .page {
    padding: .4rem;
    margin: .4rem auto;
    background: #f7f7f7;
    display: inline-block;
    width: 100%;
    border-bottom: 1px solid #eaeaea;
    border-top: 1px solid #eaeaea;
  }
  .list {
    position: relative;
    a {
    }
    a:visited {
    }
  }
  li {
    display: flex;
    justify-content: space-around;
    border-bottom: 1px solid #eaeaea;
    padding: .4rem;
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

</style>

