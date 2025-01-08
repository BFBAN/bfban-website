<template>
  <div>
    <Row class="ivu-card ivu-card-dis-hover footer-app-banner footer-border-top">
      <div class="container">
        <Col :xs="{push: 1}" :lg="{push:0}">
          <h2 class="p">BFBAN APP</h2>
          <ButtonGroup shape="circle">
            <Button type="info" to="https://play.google.com/store/apps/details?id=com.cabbagelol.bfban" target="_blank">
              <Icon type="logo-google"/>
              Google Play
            </Button>
            <Button type="info" to="https://apps.apple.com/us/app/bfban-little-helper/id6446828173" target="_blank">
              <Icon type="logo-apple"/>
              Apple Store
            </Button>
            <Button to="https://bfban-app.cabbagelol.net" target="_blank">
              <Icon type="md-open"/>
            </Button>
          </ButtonGroup>
        </Col>
      </div>
    </Row>

    <footer class="footer footer-border-top" v-if="!isFull">
      <div class="container">
        <Row :gutter="14">
          <Col :xs="{span: 23, pull: 0, push: 1, order: 2}" :sm="{span: 23 ,pull: 0, push: 1, order: 2}"
               :lg="{span: 4,pull: 0, push: 0, order:0}">
            <b>
              <Badge :count="logoCount" overflow-count="999999" :class="logoCount >= 10 ? 'shake active_infinite' : ''">
                <Avatar v-if="logoCount >= 5" size="40">
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
      langLocalSync: false,
      languages: [],
      languagesImport: {}
    }
  },
  created() {
    this.loadData();
  },
  components: {HtmlLink},
  methods: {
    async loadData() {
      this.languagesImport = await import('/public/config/languages.json');

      this.langLocalSync = account_storage.getConfiguration('langLocalSync');
      this.languages = this.languagesImport.child;

      if (this.$route.query.lang) {
        this.currentLan = this.$route.query.lang;
        return;
      }
    },
  },
  computed: {
    currentLanMembers () {
      try {
        return this.languages.filter(i => i.name === this.currentLan)[0]["members"];
      } catch (e) {
        return  [];
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

          console.log(this.$root.$i18n.locale)
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
  padding: 5rem 0 0 0;
  flex-shrink: 0;

  &.footer-border-top, .footer-border-top {
    border-top: 1px solid @footer-border-color;
  }

  .footer-padding {
    padding: 10px 0;
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
  height: 100px;
  margin-top: 15px;
  background-size: 500px;
  background-repeat: no-repeat;
}

.footer-app-banner .p {
  padding: 10px 100px 10px 0;
}

.footer-language-members {
  margin-bottom: 15px;
}

.footer-language-members .span {
  line-height: 1.5rem;
  display: contents;
}
</style>
