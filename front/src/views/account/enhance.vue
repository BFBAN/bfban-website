<template>
  <div v-if="$store.state.configuration.enhance && webMode == 'standalone'">
    <div v-for="(i, index) in enhance" :key="index">
      <Card>
        <Row>
          <Col flex="auto">
            <h1>{{i.name}}</h1>
            <p>{{i.dis}}</p>
          </Col>
          <Col>
            <i-switch v-model="i.value" @on-change="changeEnhanceAttr(i.enhanceName, i.value)"></i-switch>
          </Col>
        </Row>
      </Card>
      <br>
    </div>
  </div>
  <div v-else-if="$store.state.configuration.enhance && webMode != 'standalone'" align="center" class="enhance-notApp-content">
    <h1>No application was detected</h1>
    <p>The BFBAN WEB APP is not installed</p>
  </div>
  <div v-else>Disable Component</div>
</template>

<script>
import {account_storage} from "@/assets/js";
import store from "@/store";

export default {
  data () {
    return {
      enhance: [
        {
          name: "底部工具栏",
          dis: "网站顶部附属的工具栏，为用户提供玩家持续关注等功能",
          enhanceName: 'footerBar',
          value: this.$store.state.configuration?.footerBar || false,
        },
        {
          name: "未处理提醒",
          dis: "为管理员提供自动刷新，关注未处理玩家做出站内提醒",
          enhanceName: 'autoUpdatePlayerList',
          value: this.$store.state.configuration?.autoUpdatePlayerList || false,
        },
        {
          name: "桌面通知",
          dis: "需要安装客户端，桌面级提醒通知",
          enhanceName: 'desktopNotifiction',
          value: this.$store.state.configuration?.desktopNotifiction || false,
        }
      ]
    }
  },
  created() {

  },
  methods: {
    /**
     * 变动扩展开关
     * @param key
     * @param val
     */
    changeEnhanceAttr (key, val) {
      if (!key) return;
        account_storage.updateConfiguration(key, val);
    }
  },
  computed: {
    webMode () {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (document.referrer.startsWith('android-app://')) {
        return 'browsertab';
      } else if (navigator.standalone || isStandalone) {
        return 'standalone';
      }
      return 'browser';
    },
  }
}
</script>

<style lang="less" scoped>
.enhance-notApp-content {
  height: 100%;
  padding: 20px 0;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>