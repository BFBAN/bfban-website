<template>
  <div class="footer">
    <div class="ivu-card ivu-card-dis-hover" v-if="bannerApp">
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
            <Button @click="onFooter" shape="circle-outline">
              <Icon type="md-close"/>
            </Button>
          </Col>
        </Row>
      </div>
    </div>

    <footer class="footer-main footer-border-top" v-if="!isFull">
      <div class="container">
        <Row :gutter="14">
          <Col :xs="{span: 23, pull: 0, push: 1, order: 2}" :sm="{span: 23 ,pull: 0, push: 1, order: 2}"
               :lg="{span: 4,pull: 0, push: 0, order:0}">
            <b>
              <Badge :count="logoCount" overflow-count="999999"
                     :class="logoCount >= 1000 ? 'shake active_infinite' : ''">
                <Avatar v-if="logoCount >= 1000" size="40">
                  <router-link :to="{name: 'home', query:{ 'love': '❤'}}">😊</router-link>
                </Avatar>
                <img v-else
                     v-saknan
                     src="../assets/images/friendly-web.png"
                     width="100"
                     @click="logoCount += 1;"
                     alt="logo"/>
              </Badge>
            </b>
            <p style="margin-right: 30px">{{ $t("footer.column.col1.text") }}</p>
          </Col>
          <Col :xs="{span: 11 ,pull: 0, push: 1}" :lg="{span: 4,pull: 0, push: 0}"
               v-for="(i, index) in footerNavs.row" :key="index">
            <h4><b>{{ $t(i.text) }}</b></h4>
            <ul>
              <li v-for="({insideLang, showLang, src, text, textLang}, item_index) in i.child" :key="item_index">
                <template v-if="showLang">
                  <template v-if="showLang.filter(e => $i18n.locale === e).length > 0">
                    <a target="_blank" :href="src">
                      <template v-if="textLang">{{ textLang[$i18n.locale] || text }}</template>
                      <template v-else>{{ text }}</template>
                      <Icon type="ios-share"/>
                    </a>
                  </template>
                </template>
                <template v-else-if="insideLang">
                  <router-link :to="{name: src}">{{ $t(text) }}</router-link>
                </template>
                <template v-else>
                  <a target="_blank" :href="src">
                    <template v-if="textLang">{{ textLang[$i18n.locale] || text }}</template>
                    <template v-else>{{ text }}</template>
                    <Icon type="ios-share"/>
                  </a>
                </template>
              </li>
            </ul>
          </Col>
          <Col :xs="{span: 11 ,pull: 0, push: 1}" :lg="{span: 4,pull: 0, push: 0}">
            <Row :gutter="5">
              <Col>
                <ThemeWidget size="39px"/>
              </Col>
              <Col flex="1">
                <Select v-model="currentLan"
                        class="switch-language" prefix="md-globe" size="large"
                        :disabled="langLocalSync">
                  <Option v-for="(item, index) in languages" :key="index" :label="item.label" :value="item.name">
                    <span>{{ item.label }}</span>
                    <span style="float:right;color:#ccc">
                  {{ item.name }}
                </span>
                  </Option>
                </Select>
              </Col>
            </Row>
            <div class="footer-language-members">
              <br>
              <span>{{ $t("footer.language.members") }}</span><br>
              <template v-if="languages.length >= 0 && languages.filter(i => i.name === currentLan)">
                <span
                    class="span"
                    v-for='(i, index) in currentLanMembers' :key="index">
                  <HtmlLink :text='i.name' :href="i.url" :key="index" :isPoptip="false"></HtmlLink>
                  <Divider type="vertical"
                           v-if="index + 1 < currentLanMembers.length"></Divider>
                </span>
              </template>
            </div>
          </Col>
        </Row>
      </div>
      <div class="container mobile-hide footer-padding" v-if="links.footerStatic">
        <Row>
          <Col flex="auto">
            <h4><b>{{ $t("footer.column.sponsor.title") }}</b></h4>
          </Col>
          <Col>
            <router-link :to="{name: 'link'}">
              {{ $t("footer.column.sponsor.join") }}
            </router-link>
          </Col>
        </Row>
        <Row :gutter="10" class="footer-link" type="flex" v-if="links.footerStatic">
          <Col v-for="(link, linkindex) in links.footerChild" :key="linkindex" align="center">
            <a :href="link.linkUrl" target="_blank" class="footer-link-text">
              <img :src="link.localFilePath" height="35" :alt="link.tag" :title="link.describe">
            </a>
          </Col>
        </Row>
      </div>
      <div align="center" class="footer-border-top footer-padding">
        <p>&copy; {{ new Date(time.appStart()).getFullYear() }}-{{ new Date().getFullYear() }}
          <u>{{ infos.name || '' }}</u> All Rights Reserved. v(f):
          {{ infos['front-version'] || '' }} v(b): {{ infos['backend-version'] || '' }}
          <iframe src="https://status.bfban.com/badge" class="footer-status-badge" allowTransparency="true"
                  frameborder="0" scrolling="no"></iframe>
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import {storage, account_storage, http, time} from "../assets/js";

import packageInfo from '../../package.json';
import backendPackageInfo from '/public/config/backend-package.json';
import footerNavs from '/public/config/footerNavs.json';
import link from '/public/config/link.json';
import HtmlLink from '@/components/HtmlLink.vue'
import Application from "@/assets/js/application";
import ThemeWidget from "@/components/ThemeWidget.vue";

export default new Application({
  data() {
    let infos = {
      'front-version': packageInfo['version'] || '0.0.0',
      'backend-version': backendPackageInfo['version'] || '0.0.0'
    };
    return {
      time,
      infos,

      footerNavs: footerNavs.child,
      links: link,

      logoCount: 0,
      bannerApp: true,

      langLocalSync: false,
      languages: [],
      languagesImport: {}
    }
  },
  created() {
    this.loadData();
  },
  components: {HtmlLink, ThemeWidget},
  methods: {
    async loadData() {
      const bannerAppData = await storage.local.get('footer.bannerApp');
      this.languagesImport = await import('/public/config/languages.json');

      this.langLocalSync = account_storage.getConfiguration('langLocalSync');
      this.languages = this.languagesImport.child;

      if (bannerAppData.code === 0) {
        this.bannerApp = bannerAppData.data.value;

        if (bannerAppData.data.time > Number(bannerAppData.data.time) + 7 * 24 * 60 * 60 * 1000) {
          await storage.local.rem('footer.bannerApp');
          this.bannerApp = false;
        }
      }

      if (this.$route.query.lang) {
        this.currentLan = this.$route.query.lang;
      }
    },
    onFooter() {
      this.bannerApp = !this.bannerApp;
      storage.local.set('footer.bannerApp', this.bannerApp);
    }
  },
  computed: {
    currentLanMembers() {
      try {
        return this.languages.filter(i => i.name === this.currentLan)[0]["members"];
      } catch (e) {
        return [];
      }
    },
    currentLan: {
      set(val) {
        const lang = val;
        // 路由语言
        this.$store.dispatch('setLang', lang);
        // 本地持久语言
        storage.local.set('language', lang);
        // 网页语言
        document.getElementsByTagName('html')[0].lang = lang;
      },
      get() {
        try {
          const localAppLanguages = this.$root && this.$root.$i18n && this.$root.$i18n.locale;
          const localStorageLanguage = storage.local.get('language')?.data?.value;
          const localWebLanguage = this.$route.query.lang;

          // This is not the place to initialize the language
          http.setGlobalHeader({'Accept-Language': localWebLanguage || localStorageLanguage || localAppLanguages || 'zh-CN'})

          return localWebLanguage || localStorageLanguage || localAppLanguages || this.languagesImport.default.default;
        } catch (e) {
          return this.languagesImport.default.default;
        }
      }
    }
  }
})
</script>

<style lang="less" scoped>
@import "@/assets/css/footer";

@footer-primary-color: #fff;
@footer-border-color: #00000008;
@footer-icon-color: #c5c5c5;

.footer {
  text-align: left;
  flex-shrink: 0;
  margin-top: 15px;

  &.footer-border-top, .footer-border-top {
    border-top: 1px solid @footer-border-color;
  }

  .footer-padding {
    padding: 10px 5px;
  }

  .footer-main {
    padding: 5rem 0 0 0;
  }

  ul {
    display: block;
    margin-bottom: 10px;
    list-style-type: none;

    a {
      display: inline-block;
      margin-bottom: 6px;
      font-size: 13px;
      animation: all .25s;
    }

    a:hover {
      background: rgba(0, 0, 0, 0.04);
      padding: 1px 5px;
      border-radius: 5px;
      margin-left: -5px;
      margin-top: -1px;
      margin-bottom: 5px;
    }

    .ivu-icon {
      color: @footer-icon-color;
      font-size: 15px;
    }
  }

  b {
    display: block;
    margin-bottom: 15px;
    font-size: 20px;
  }

  .footer-status-badge {
    margin: -10px 0;
    height: 30px;
    width: 182px;
    border-radius: 10px;
  }
}

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

.footer-language-members {
  margin-bottom: 15px;
}

.footer-language-members .span {
  line-height: 1.5rem;
  display: contents;
}
</style>
