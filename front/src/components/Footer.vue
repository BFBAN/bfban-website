<template>
  <div>
    <div class="ivu-card ivu-card-dis-hover footer-app-banner footer-border-top">
      <div class="container">
        <h2 class="p">BFBAN APP</h2>
        <a href="https://bfban-app.cabbagelol.net" target="_blank">
          <Button>
            <Icon type="md-download"/>
            Download
          </Button>
        </a>
      </div>
    </div>

    <footer class="footer footer-border-top" v-if="!isFull">
      <div class="container">
        <Row>
          <Col :xs="{span: 23, pull: 0, push: 1, order: 2}" :sm="{span: 23 ,pull: 0, push: 1, order: 2}"
               :lg="{span: 5,pull: 0, push: 0,order:0}">
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
            <p style="margin-right: 10px">{{ $t("footer.column.col1.text") }}</p>
          </Col>
          <Col :xs="{span: 11 ,pull: 0, push: 1}" :lg="{span: 5,pull: 0, push: 0}"
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
            <Select v-model="currentLan" class="switch-language" prefix="md-globe" size="large"
                    :disabled="langLocalSync">
              <Option v-for="(item, index) in languages" :key="index" :label="item.label" :value="item.name">
                <span>{{ item.label }}</span>
                <span style="float:right;color:#ccc">
                {{ item.name }}
              </span>
              </Option>
            </Select>
            <p v-if="languages.length > 0">
              <br>
              <span>{{ $t("footer.language.members") }}</span>: <br>
              <a :href="i.url" target="_blank"
                 v-for='(i, index) in languages.filter(i => i.name === currentLan)[0]["members"]' :key="index">
                {{ i.name }}
                <Divider type="vertical"
                         v-if="index + 1 < (languages.filter(i => i.name === currentLan)[0]['members'].length)"></Divider>
              </a>
            </p>
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
        <p>&copy; {{ new Date(time.appStart()).getFullYear() }}-{{ new Date().getFullYear() }} <u>{{ infos.name || ''}}</u> All Rights Reserved. v:
          {{ infos.version || '' }}</p>
      </div>
    </footer>
  </div>
</template>

<script>
import {storage, account_storage, http, time} from "../assets/js";

import packageInfo from '../../package.json';
import footerNavs from '/public/config/footerNavs.json';
import link from '/public/config/link.json';
import Application from "@/assets/js/application";

export default new Application({
  data() {
    return {
      time,
      infos: packageInfo,
      footerNavs: footerNavs.child,
      links: link,
      logoCount: 0,
      langLocalSync: false,
      languages: [],
    }
  },
  created() {
    this.loadData();
  },
  watch: {
    $route: "loadData",
  },
  methods: {
    async loadData() {
      const languages = await import('/public/config/languages.json');

      this.langLocalSync = account_storage.getConfiguration('langLocalSync');
      this.languages = languages.child;
      // this.loadLanguages();
    },
    async loadLanguages() {
      let that = this;
      let lang = this.currentLan;
      setTimeout(function () {
        if (this.langLocalSync)
          that.$store.dispatch('setLang', lang);
      }, 200)
    }
  },
  computed: {
    currentLan: {
      set(val) {
        const lang = val;
        // 路由语言
        this.$store.dispatch('setLang', lang);
        // 本地持久语言
        storage.set('language', lang);
        // 网页语言
        document.getElementsByTagName('html')[0].lang = lang;
      },
      get() {
        const localAppLanguages = this.$root && this.$root.$i18n && this.$root.$i18n.locale;
        const localSroeageLanguage = storage.get('language')?.data?.value;
        const loaclWebLanguage = this.$route.query.lang;

        // This is not the place to initialize the language
        http.setGlobalHeader({'Accept-Language': loaclWebLanguage || localSroeageLanguage || localAppLanguages || 'zh-CN'})

        return loaclWebLanguage || localSroeageLanguage || localAppLanguages || 'zh-CN';
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
  padding: 3rem 0 0 0;
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
      display: block;
      margin-bottom: 5px;
      font-size: 12px;
    }

    .ivu-icon {
      color: @footer-icon-color;
      font-size: 15px;
    }
  }

  b {
    display: block;
    margin-bottom: 10px;
    font-size: 20px;
  }

  .footer-link {

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
</style>
