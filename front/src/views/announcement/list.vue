<template>
  <div class="announcementView">
    <div class="list">
      <Card class="item" v-for="item in list" :key="item.label">
        <template #title><span class="ruleName">{{item.name}}</span></template>
        <!-- <p class="ruleDesc">{{item.desc}}</p> -->
        <Divider orientation="left" size="small" class="divider">版本</Divider>
        <div class="version">
          <div v-for="(i, index) in item.list" :key="i" @click="jump(item.route, i)">
            <!-- <span>{{item.title.cn}}</span> -->
            <span>{{i}} <span v-if="index === 0">(最新)</span></span>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>

const personnel = require.context(`./data/personnel/`, true, /.json$/)
const antiCheat = require.context(`./data/antiCheat/`, true, /.json$/)
const conduct = require.context(`./data/conduct/`, true, /.json$/)
export default {
  data() {
    return {
      list: [
        {
          name: 'BFBAN人事规则',
          route: 'personnel',
          desc: 'BFBAN人事规则BFBAN人事规则BFBAN人事规则BFBAN人事规则BFBAN人事规则BFBAN人事规则BFBAN人事规则BFBAN人事规则BFBAN人事规则',
          list: personnel.keys().map(key => this.splitFileName(key).replace('./', ''))
        },
        {
          name: 'BFBAN反作弊规则',
          route: 'antiCheat',
          desc: 'BFBAN反作弊规则BFBAN反作弊规则BFBAN反作弊规则BFBAN反作弊规则BFBAN反作弊规则BFBAN反作弊规则BFBAN反作弊规则BFBAN反作弊规则BFBAN反作弊规则BFBAN反作弊规则',
          list: antiCheat.keys().map(key => this.splitFileName(key).replace('./', ''))
        },
        {
          name: 'BFBAN行为规则',
          route: 'conduct',
          desc: 'BFBAN行为规则BFBAN行为规则BFBAN行为规则BFBAN行为规则BFBAN行为规则BFBAN行为规则BFBAN反作弊规则BFBAN反作弊规则BFBAN反作弊规则BFBAN反作弊规则BFBAN反作弊规则BFBAN反作弊规则BFBAN反作弊规则',
          list: conduct.keys().map(key => this.splitFileName(key).replace('./', ''))
        }
      ]
    }
  },
  methods: {
    splitFileName(text) {
      var pattern = /\.{1}[a-z]{1,}$/;
      if (pattern.exec(text) !== null) {
        return (text.slice(0, pattern.exec(text).index));
      } else {
        return text;
      }
    },
    jump(route, date) {
      this.$router.push({
        name: 'announcementDetails',
        query: {
          route, date
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.announcementView {
  width: 960px;
  margin: 0 auto;
  .list {
    .item {
      // border-bottom: 1px solid #afb8c1;
      margin-bottom: 30px;
      .ruleName {
        font-size: 18px;
        color: #17233d;
      }
      .ruleDesc {
        color: rgba(0,0,0,.45);
      }
      .divider {
        color: #333;
      }
      .version {
        font-size: 13px;
        color: #aaa;
        >div {
          display: flex;
          justify-content: space-between;
          padding: 0 16px;
          margin-block: 5px;
          span:first-child {
            text-decoration: underline;
            cursor: pointer;
            text-underline-offset: 3px;
          }
        }
      }
    }
  }
}
</style>