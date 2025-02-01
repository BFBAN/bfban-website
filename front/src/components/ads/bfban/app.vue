<script setup>
import {account_storage} from "@/assets/js";

import HtmlLink from '@/components/HtmlLink.vue'
import Application from "@/assets/js/application";
import ThemeWidget from "@/components/ThemeWidget.vue";

export default new Application({
  data() {
    return {
      banner: true,
    }
  },
  created() {
    this.loadData();
  },
  components: {HtmlLink, ThemeWidget},
  methods: {
    async loadData() {
      const bannerAppData = account_storage.getConfiguration('ads.bfban-app.switch');
      this.banner = bannerAppData;
    },
    /**
     * 关闭底部广告
     */
    onSwitchFooter() {
      this.banner = !this.banner;
      account_storage.updateConfiguration('ads.bfban-app.switch', this.banner);
    }
  },
})
</script>

<template>
  <div class="ivu-card ivu-card-dis-hover" v-if="banner && !$route.query.full">
    <div class="container footer-app-banner footer-border-top">
      <Row :gutter="10" type="flex" align="middle">
        <Col :xs="{push: 1}" :lg="{span: 23,push:0}">
          <h2 class="p">BFBAN APP</h2>
          <ButtonGroup shape="circle" class="btn">
            <Button type="info" to="https://play.google.com/store/apps/details?id=com.cabbagelol.bfban"
                    target="_blank">
              <Icon type="logo-google"/>
              Google Play
            </Button>
            <Button type="info" to="https://apps.apple.com/us/app/bfban-little-helper/id6446828173" target="_blank">
              <Icon type="logo-apple"/>
              Apple Store
            </Button>
            <Button type="info" to="https://f-droid.org/packages/com.cabbagelol.bfban" target="_blank">
              <i class="ivu-icon">
                <svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 24 24" width="12px" height="12px">
                  <path
                      fill="#fff"
                      d="M20.472,10.081H3.528c-0.877,0-1.589,0.711-1.589,1.589v10.59c0,0.877,0.711,1.589,1.589,1.589h16.944 c0.877,0,1.589-0.711,1.589-1.589V11.67C22.061,10.792,21.349,10.081,20.472,10.081z M12,22.525c-3.066,0-5.56-2.494-5.56-5.56 s2.494-5.56,5.56-5.56c3.066,0,5.56,2.494,5.56,5.56S15.066,22.525,12,22.525z M12,12.411c-2.511,0-4.554,2.043-4.554,4.554 S9.489,21.519,12,21.519s4.554-2.043,4.554-4.554S14.511,12.411,12,12.411z M12,20.274c-1.563,0-2.881-1.103-3.221-2.568h1.67 c0.275,0.581,0.859,0.979,1.551,0.979c0.96,0,1.721-0.761,1.721-1.721c0-0.96-0.761-1.721-1.721-1.721 c-0.649,0-1.2,0.352-1.493,0.874H8.805c0.378-1.412,1.669-2.462,3.195-2.462c1.818,0,3.309,1.491,3.309,3.309 C15.309,18.783,13.818,20.274,12,20.274z M23.849,0.396c-0.001,0.001-0.002,0.002-0.002,0.003 c-0.002-0.002-0.004-0.003-0.006-0.005c0.001-0.001,0.002-0.003,0.004-0.004c-0.116-0.137-0.279-0.231-0.519-0.238 c-0.202,0.005-0.391,0.097-0.512,0.259l-1.818,2.353c-0.164-0.058-0.339-0.095-0.523-0.095H3.528c-0.184,0-0.358,0.038-0.523,0.095 L1.187,0.41c-0.121-0.162-0.31-0.253-0.512-0.259c-0.24,0.006-0.403,0.1-0.519,0.238c0.001,0.001,0.002,0.003,0.004,0.004 C0.157,0.395,0.155,0.397,0.153,0.399C0.153,0.398,0.152,0.397,0.151,0.396C0.085,0.474-0.146,0.822,0.139,1.22l1.909,2.471 C1.981,3.867,1.94,4.057,1.94,4.257v3.707c0,0.877,0.711,1.589,1.589,1.589h16.944c0.877,0,1.589-0.711,1.589-1.589V4.257 c0-0.2-0.041-0.39-0.109-0.566l1.909-2.471C24.146,0.822,23.915,0.474,23.849,0.396z M6.904,8.228c-0.987,0-1.787-0.8-1.787-1.787 s0.8-1.787,1.787-1.787s1.787,0.8,1.787,1.787S7.891,8.228,6.904,8.228z M17.229,8.228c-0.987,0-1.787-0.8-1.787-1.787 s0.8-1.787,1.787-1.787c0.987,0,1.787,0.8,1.787,1.787S18.216,8.228,17.229,8.228z"/>
                </svg>
              </i>
              F Droid
            </Button>
            <Button to="https://bfban-app.cabbagelol.net" target="_blank">
              <Icon type="md-open"/>
            </Button>
          </ButtonGroup>
        </Col>
        <Col :xs="{span: 1}" :lg="{span: 1}">
          <Button @click="onSwitchFooter" shape="circle-outline">
            <Icon type="md-close"/>
          </Button>
        </Col>
      </Row>
    </div>
  </div>
</template>

<style scoped lang="less">
.footer-app-banner {
  background-position: calc(50% + 300px) -25px;
  background-image: url('https://bfban-app.cabbagelol.net/images/exhibition.png');
  background-size: 500px;
  background-repeat: no-repeat;

  & .p {
    padding: 10px 100px 5px 0;
  }

  & .btn {
    margin-bottom: 15px;
  }
}
</style>
