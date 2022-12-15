<template>
  <div class="announcement">
    <div class="title">{{config.name}}</div>
    <div class="user">
      <div class="name">{{config.author.name}}</div>
      <div class="date">{{config.date}}</div>
    </div>
    <div class="content">
      <item :data="config.content.nodes" />
    </div>
  </div>
</template>

<script>
import item from './components/item.vue'
// import config from './config'
export default {
  components: { item },
  data() {
    return {
      config: []
    }
  },
  created() {
    const { route, date } = this.$route.query
    const data = require(`./data/${route}/${date}.json`)
    this.config = data
  },
}
</script>

<style lang="scss" scoped>
.announcement {
  width: 760px;
  margin: 0 auto;
  .title {
    min-height: 42px;
    color: #16181a;
    font-size: 34px;
    font-weight: 600;
    line-height: 48px;
    // text-align: center;
    padding: 30px 10px 10px;
  }
  .user {
    margin: 14px 10px 24px;
    .name {
      color: rgb(44, 44, 47);
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      text-overflow: ellipsis;
      word-break: break-all;
    }
    .date {
      color: rgb(146, 146, 156);
      font-size: 12px;
      font-weight: normal;
      line-height: 1.45;
    }
  }
}
</style>