<template>
  <div>
    <Divider>外挂公示</Divider>

    <!--Filters:-->
    <!--状态checkbox、-->
    <!--创建时间（时间段）、-->
    <!--操作时间（时间段）、-->
    <!--id搜索-->

    <div>
      <RadioGroup v-model="statusGroup" @on-change="handleStatusChange" type="button">
        <Radio label=""><span>全部</span></Radio>
        <Radio label="0"><span>未处理</span></Radio>
        <Radio label="1"><span>石锤</span></Radio>
        <Radio label="2"><span>嫌疑玩家再观察</span></Radio>
        <Radio label="3"><span>没有问题不是挂</span></Radio>
        <Radio label="4"><span>捣乱的</span></Radio>
      </RadioGroup>

      <DatePicker :value="cd" type="daterange" @on-change="handleCDatepicker" split-panels placeholder="举报日期范围" style="width: 200px"></DatePicker>
      <DatePicker :value="ud" type="daterange" @on-change="handleUDatepicker" split-panels placeholder="处理日期范围" style="width: 200px"></DatePicker>
    </div>

    <Button style="margin: .4rem 0;" icon="ios-refresh" @click.prevent.stop="handleRefresh">刷新</Button>

    <div style="position: relative;">
      <ul>
        <li>
          <span><b>游戏ID</b></span>
          <span><b>处理状态</b></span>
          <!-- 0=> 未处理，1=> 石锤，2=> 嫌疑玩家再观察，3=> 没有问题不是挂，4=> 捣乱的 -->
          <span><b>举报时间</b></span>
          <span><b>处理时间</b></span>
        </li>
        <li v-for="d in data" :key="d.u_id">
          <span>
            <router-link target="_blank" :to="{name: 'cheater', params: { uid: `${d.u_id}` }}">{{d.origin_id}}</router-link>
            <Button size="small" type="text" icon="ios-copy-outline" :data-clipboard-text="d.origin_id" @click="copied"></Button>
          </span>
          <span>
            {{ handleStatus(d.status) }}
          </span>
          <span>
            <Time v-if="d.create_datetime" :time="d.create_datetime" type="date" />
          </span>


          <span>
            <Time v-if="d.update_datetime" :time="d.update_datetime" type="date" />
          </span>
        </li>
      </ul>
      <br>

      <Page show-total :current="page" @on-change="handlePageChange" :total="total" />

      <Spin size="large" fix v-show="spinShow"></Spin>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const ClipboardJS = require('clipboard');
new ClipboardJS('.ivu-btn');

export default {
  data() {
    return {
      data: [
      ],
      spinShow: true,
      statusGroup: '',
      cd: ['', ''],
      ud: ['', ''],
      page: 1,
      total: 0,
    }
  },
  created() {
    this.loadData();
  },
  watch: {
    '$route': 'loadData',
  },
  methods: {
    copied() {
      this.$Message.info('已复制');
    },
    loadData() {
      const { status = '', cd = '', ud = '', page = 1 } = this.$route.query;

      const config = {
        method: 'get',
        url: '/cheaters/',
      };

      config['params'] = {
        status,
        cd,
        ud,
        page,
      };
      this.statusGroup = status;
      this.cd = cd.split(',');
      this.ud = ud.split(',');
      this.page = Number.parseInt(page);

      axios(config)
      .then((res) => {
        this.spinShow = false;

        const d = res.data;
        this.data = d.data;
        this.total = d.total;

      })
    },
    handleStatus(status) {
      const statusObj = {
        0: "未处理",
        1: "石锤",
        2: "嫌疑玩家再观察",
        3: "没有问题不是挂",
        4: "捣乱的",
      }

      return statusObj[status]
    },
    handleRefresh() {
      this.spinShow = true;

      this.loadData();
    },
    routerQuery() {
      const status = this.statusGroup;
      const cd = this.cd.join(',');
      const ud = this.ud.join(',');
      const page = this.page;

      let o = {};

      if (status) o['status'] = status;
      if (cd !== ',') o['cd'] = cd;
      if (ud !== ',') o['ud'] = ud;
      if (page !== 1) o['page'] = page;

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
    }
  }
}
</script>

<style lang="scss" scoped>
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
      flex-grow: 0;
      flex-shrink: 0;
      flex-basis: 10%;
    }
    span:nth-child(4) {
      flex-grow: 0;
      flex-shrink: 0;
      flex-basis: 10%;
    }
  }

</style>

