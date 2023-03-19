<template>
  <div class="container announcementView">
    <br>
    <Row>
      <Col :xs="{push: 1}" :lg="{push: 0}">
        <Breadcrumb>
          <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem :to="{name: 'announcement'}">{{ $t("home.bulletin.title") }}</BreadcrumbItem>
        </Breadcrumb>
      </Col>
    </Row>
    <br>

    <div class="list">
      <Card class="item" v-for="item in list" :key="item.label">
        <template #title><span class="ruleName">{{item.name}}</span></template>
        <p class="ruleDesc">{{item.desc.cn}}</p>
        <Divider orientation="left" size="small" class="divider">{{$t("announcement.version")}}</Divider>
        <div class="version">
          <div v-for="(i, index) in item.list" :key="i" @click="jump(item.route, i)">
            <!-- <span>{{item.title.cn}}</span> -->
            <span>{{i}} <span v-if="index === 0">({{$t("announcement.latest")}})</span></span>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
const cnPacket = {}
{
  const personnel = require.context(`./data/CN/personnel/`, true, /.json$/)
  const antiCheat = require.context(`./data/CN/antiCheat/`, true, /.json$/)
  const conduct = require.context(`./data/CN/conduct/`, true, /.json$/)
  cnPacket.personnel = personnel
  cnPacket.antiCheat = antiCheat
  cnPacket.conduct = conduct
}
const enPacket = {}
{
  const personnel = require.context(`./data/US/personnel/`, true, /.json$/)
  const antiCheat = require.context(`./data/US/antiCheat/`, true, /.json$/)
  const conduct = require.context(`./data/US/conduct/`, true, /.json$/)
  enPacket.personnel = personnel
  enPacket.antiCheat = antiCheat
  enPacket.conduct = conduct
}
export default {
  data() {
    return {
    }
  },
  computed: {
    list() {
      const { personnel, antiCheat, conduct } = this.$i18n.locale == "zh-CN" ? cnPacket : enPacket
      return [
        {
          name: this.$i18n.t("announcement.personnel.name"),
          route: 'personnel',
          desc: {
            cn: this.$i18n.t("announcement.personnel.intro")
          },
          list: personnel.keys().map(key => this.splitFileName(key).replace('./', '')).reverse()
        },
        {
          name: this.$i18n.t("announcement.antiCheat.name"),
          route: 'antiCheat',
          desc: {
            cn: this.$i18n.t("announcement.antiCheat.intro")
          },
          list: antiCheat.keys().map(key => this.splitFileName(key).replace('./', '')).reverse()
        },
        {
          name: this.$i18n.t("announcement.conduct.name"),
          route: 'conduct',
          desc: {
            cn: this.$i18n.t("announcement.conduct.intro")
          },
          list: conduct.keys().map(key => this.splitFileName(key).replace('./', '')).reverse()
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

<style lang="less" scoped>
.announcementView {
  width: 960px;
  margin: 0 auto;
  .list {
    .item {
      // border-bottom: 1px solid #afb8c1;
      margin-bottom: 30px;
      .ruleName {
        font-size: 18px;
      }
      .ruleDesc {
        opacity: .7;
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
