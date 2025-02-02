<template>
  <div class="profile-body" v-if="$store.state.configuration.enhance">
    <div>
      <List border>
        <ListItem v-for="(i, index) in enhance" :key="index">
          <ListItemMeta
              :title="$t(`profile.enhance.public.${i.enhanceName}.name`)"
              :description="$t(`profile.enhance.public.${i.enhanceName}.describe`)"
          ></ListItemMeta>
          <i-switch v-model="i.value" @on-change="changeEnhanceAttr(i.enhanceName, i.value)"></i-switch>
        </ListItem>
      </List>
      <br>
    </div>
  </div>
  <div class="profile-body enhance-notApp-content" v-else-if="$store.state.configuration.enhance || false"
       align="center">
    <h1>No application was detected</h1>
    <p>The BFBAN WEB APP is not installed</p>
  </div>
  <div class="profile-body" v-else>
    <p>Disable Component</p>
    <div><img src="@/assets/images/open-component.png" width="80%"/></div>
  </div>
</template>

<script>
import {account_storage} from "@/assets/js";

export default {
  data() {
    return {
      enhance: [
        {
          enhanceName: 'footerBar',
          value: this.$store.state?.configuration?.footerBar || false,
        },
        {
          enhanceName: 'autoUpdatePlayerList',
          value: this.$store.state?.configuration?.autoUpdatePlayerList || false,
        },
        {
          enhanceName: 'desktopNotification',
          value: this.$store.state?.configuration?.desktopNotification || false,
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
    changeEnhanceAttr(key, val) {
      if (!key) return;
      account_storage.updateConfiguration(key, val);
    }
  },
  computed: {
    webMode() {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (document.referrer.startsWith('bfban://')) {
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
