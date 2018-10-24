<template>
  <div>
    <Divider>外挂公示</Divider>
    Filters:
    状态checkbox、
    创建时间（时间段）、
    操作时间（时间段）、
    id搜索

    <br>
    <RadioGroup v-model="statusGroup" @on-change="handleStatusChange" type="button">
      <Radio label=""><span>全部</span></Radio>
      <Radio label="0"><span>未处理</span></Radio>
      <Radio label="1"><span>石锤</span></Radio>
      <Radio label="2"><span>嫌疑玩家再观察</span></Radio>
      <Radio label="3"><span>没有问题不是挂</span></Radio>
      <Radio label="4"><span>捣乱的</span></Radio>
    </RadioGroup>

    <Button icon="ios-refresh" @click.prevent.stop="handleRefresh">刷新</Button>

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
          <router-link :to="{name: 'cheater', params: { uid: `${d.u_id}` }}">{{d.origin_id}}</router-link>
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
      <Spin size="large" fix v-if="spinShow"></Spin>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      data: [
      ],
      spinShow: true,
      statusGroup: ''
    }
  },
  created() {
    this.loadData();
  },
  // beforeRouteUpdate(to, from, next) {
  //   this.loadData();
  //   next();
  // },
  watch: {
    '$route': 'loadData',
  },
  methods: {
    loadData() {
      const status = this.$route.query.status || '';

      const config = {
        method: 'get',
        url: '/cheaters/',
      };

      config['params'] = {
        status,
      };
      this.statusGroup = status;

      axios(config)
      .then((res) => {
        this.spinShow = false;

        const d = res.data;
        this.data = d.data;

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
    handleStatusChange() {
      this.spinShow = true;

      const status = this.statusGroup;
      this.$router.push({name: 'cheaters', query: {status}});
    },
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

