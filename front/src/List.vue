<template>
  <div class="container">
    <div class="content">
      <Divider>外挂公示</Divider>

      <!--Filters:-->
      <!--状态checkbox、-->
      <!--创建时间（时间段）、-->
      <!--操作时间（时间段）、-->
      <!--id搜索-->

      <p>
        <RadioGroup v-model="gameName" @on-change="handleChanges" type="button">
          <Radio label="bf1"><span>战地1({{getTotalNum('bf1')}})</span></Radio>
          <Radio label="bfv"><span>战地v({{getTotalNum('bfv')}})</span></Radio>
        </RadioGroup>
      </p>
      <p>
        <RadioGroup v-model="statusGroup" @on-change="handleStatusChange" type="button">
          <Radio label=""><span>全部({{getAllStatusNum}})</span></Radio>
          <Radio v-for="status in cheaterStatus" :key="status.value" :label="`${status.value}`">
            <span>{{ status.label }}({{ getStatusNum(status.value)}})</span>
          </Radio>
        </RadioGroup>
      </p>
      <p>
        <DatePicker :value="cd" type="daterange" @on-change="handleCDatepicker" split-panels placeholder="举报日期范围" style="width: 200px"></DatePicker>
        <DatePicker :value="ud" type="daterange" @on-change="handleUDatepicker" split-panels placeholder="处理日期范围" style="width: 200px"></DatePicker>
      </p>

      <p>
        排序：
        <Select @on-change="handleSortByChange" v-model="sortByValue" style="width:110px">
          <Option v-for="item in sortBy" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>

        <Button icon="ios-refresh" @click.prevent.stop="handleRefresh">刷新</Button>
      </p>


      <div class="list">
        <ul>
          <li>
            <span><b>游戏ID</b></span>
            <span><b>处理状态</b></span>
            <span><b>作弊方式</b></span>
            <span><b>举报时间</b></span>
            <span><b>处理时间</b></span>
          </li>
          <li v-for="d in data" :key="d.uId">
          <span>
            <router-link :to="{name: 'cheater', params: { game: gameName, uid: `${d.uId}` }}">{{d.originId}}</router-link>
            <Button size="small" type="text" icon="ios-copy-outline" :data-clipboard-text="d.originId" @click="copied"></Button>
          </span>
            <span>
            {{ handleStatus(d.status) }}
          </span>
            <span>
            <Tag v-if="d.cheatMethods" color="warning">
              {{convertCheatMethods(d.cheatMethods || '')}}
            </Tag>
          </span>
            <span>
            <Time v-if="d.createDatetime" :time="d.createDatetime" />
          </span>


            <span>
            <Time v-if="d.updateDatetime" :time="d.updateDatetime" />
          </span>
          </li>
        </ul>
        <br>

        <Page :page-size="20" show-total :current="page" @on-change="handlePageChange" :total="total" />

        <Spin size="large" fix v-show="spinShow"></Spin>
      </div>
    </div>
  </div>

</template>

<script>
import { getCheaterStatusLabel, cheaterStatus } from './common';

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
      total: 0,
      sum: [],
      totalSum: [],

      sortBy: [
        {
          value: 'updateDatetime',
          label: '处理时间倒序',
        },
        {
          value: 'createDatetime',
          label: '举报时间倒序',
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
    }
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
      const { game = 'bf1', status = '1', cd = '', ud = '', page = 1, sort='createDatetime' } = this.$route.query;

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
      };
      this.gameName = game;
      this.statusGroup = status;
      this.cd = cd.split(',');
      this.ud = ud.split(',');
      this.page = Number.parseInt(page);
      this.sortByValue = sort;

      axios(config)
      .then((res) => {
        this.spinShow = false;

        const d = res.data;
        this.data = d.data;
        this.total = d.total;
        this.sum = d.sum;
        this.totalSum = d.totalSum;

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
      const sort = this.sortByValue;

      let o = {};

      o['status'] = status;
      if (cd !== ',') o['cd'] = cd;
      if (ud !== ',') o['ud'] = ud;
      if (page !== 1) o['page'] = page;
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
    padding: 1rem;

    &:nth-child(odd) {
      background-color: #eeeeee61;
    }

    span:nth-child(1) {
      flex-grow: 0;
      flex-shrink: 0;
      flex-basis: 30%;
    }
    span:nth-child(2) {
      flex-grow: 1;
    }
    span:nth-child(3) {
      flex-grow: 2;
      flex-shrink: 0;
      flex-basis: 10%;
    }
    span:nth-child(4) {
      flex-grow: 0;
      flex-shrink: 0;
      flex-basis: 10%;
    }
    span:nth-child(5) {
      flex-grow: 0;
      flex-shrink: 0;
      flex-basis: 10%;
    }
  }

</style>

