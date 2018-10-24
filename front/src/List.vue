<template>
  <div>
    <Divider>外挂公示</Divider>
    Filters:
    状态checkbox、
    创建时间（时间段）、
    操作时间（时间段）、
    id搜索
    <div>
      <ul>
        <li>
          <span>游戏ID</span>
          <span>处理状态</span>
          <!-- 0=> 未处理，1=> 石锤，2=> 嫌疑玩家再观察，3=> 没有问题不是挂，4=> 捣乱的 -->
        </li>
        <li v-for="d in data" :key="d.u_id">
        <span>
          <router-link :to="{name: 'cheater', params: { uid: `${d.u_id}` }}">{{d.origin_id}}</router-link>
        </span>
          <span>
          {{ handleStatus(d.status) }}
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
      spinShow: true
    }
  },
  created() {
    axios({
      method: 'get',
      url: '/cheaters/',
    })
    .then((res) => {
      const d = res.data;
      this.data = d.data;

      this.spinShow = false;
    })
  },
  methods: {
    handleStatus(status) {
      const statusObj = {
        0: "未处理",
        1: "石锤",
        2: "嫌疑玩家再观察",
        3: "没有问题不是挂",
        4: "搞乱的",
      }

      return statusObj[status]
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
  }

</style>

