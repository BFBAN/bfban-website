<template>
  <footer class="footer footer-border-top" v-if="!isFull">
    <div class="container">
      <Row>
        <Col :xs="{span: 18 ,pull: 0, push: 1}" :lg="{span: 5,pull: 0, push: 0}" class="mobile-hide">
          <Badge :count="logoCount" overflow-count="999999" :class="logoCount >= 10 ? 'shake active_infinite' : ''">
            <Avatar v-if="logoCount >= 5" size="40">
              <router-link :to="{name: 'home', query:{ '': '❤'}}">😊</router-link>
            </Avatar>
            <img v-else
                 src="../assets/images/logo.png"
                 width="40"
                 height="40"
                 @click="logoCount += 1;"
                 alt="bfban logo"/>
          </Badge>
          <p>{{ $t("footer.column.col1.text") }}</p>
        </Col>
        <Col :xs="{span: 9 ,pull: 0, push: 1}" :lg="{span: 5,pull: 0, push: 0}" class="mobile-hide"
             v-for="(i, index) in footerNavs.row" :key="index">
          <h4><b>{{ $t(i.text) }}</b></h4>
          <ul>
            <li v-for="(itemi, itemindex) in i.child" :key="itemindex">
              <template v-if="itemi.showLang">
                <template v-if="itemi.showLang.filter(e => $i18n.locale == e).length > 0">
                  <a target="_blank" :href="itemi.src">
                    <template v-if="itemi.textLang">{{ itemi.textLang[$i18n.locale] || itemi.text }}</template>
                    <template v-else>{{ itemi.text }}</template>
                    <Icon type="ios-share"/>
                  </a>
                </template>
              </template>
              <template v-else-if="itemi.insideLang">
                <router-link :to="{name: itemi.src}">{{ $t(itemi.text) }}</router-link>
              </template>
              <template v-else>
                <a target="_blank" :href="itemi.src">
                  <template v-if="itemi.textLang">{{ itemi.textLang[$i18n.locale] || itemi.text }}</template>
                  <template v-else>{{ itemi.text }}</template>
                  <Icon type="ios-share"/>
                </a>
              </template>
            </li>
          </ul>
        </Col>
        <Col :xs="{span: 18 ,pull: 0, push: 1}" :lg="{span: 4,pull: 0, push: 0}">
          <Select v-model="currentLan" class="switch-language" prefix="md-globe" size="large" :disabled="langLoaclSync">
            <Option v-for="(item, index) in languages" :value="item.name" :label="item.label" :key="index">
                  <span>
                    {{ item.label }}
                  </span>
              <span style="float:right;color:#ccc">
                    {{ item.name }}
                  </span>
            </Option>
          </Select>
          <p v-if="languages.length > 0">
            <br>
            <span>{{ $t("footer.language.members") }}</span>: <br>
            <a v-for='(i, index) in languages.filter(i => i.name == currentLan)[0]["members"]' :key="index"
               :href="i.url" target="_blank">
              {{ i.name }}
            </a>
          </p>
        </Col>
      </Row>
    </div>
    <div class="container mobile-hide footer-padding">
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
      <Row :gutter="5" class="footer-link" type="flex">
        <Col v-for="(link, linkindex) in links" :key="linkindex" align="center">
          <a :href="link.linkUrl" target="_blank" class="footer-link-text">
            <img :src="link.linkImageUrl" width="100" height="35" :alt="link.tag" :title="link.describe">
          </a>
        </Col>
      </Row>
    </div>
    <div align="center" class="mobile-hide footer-border-top footer-padding">
      <p>&copy; 2018-{{ new Date().getFullYear() }} All Rights Reserved. v: {{ infos }}</p>
    </div>
  </footer>
</template>

<script>
import {storage, account_storage} from "../assets/js";

import packageInfo from '../../package.json';
import footerNavs from '/public/conf/footerNavs.json';
import link from '/public/conf/link.json';

export default {
  data() {
    return {
      infos: packageInfo.version,
      footerNavs: footerNavs.child,
      links: link.footerChild,
      logoCount: 0,
      langLoaclSync: false,
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
      const languages = await import('/public/conf/languages.json');

      this.langLoaclSync = account_storage.getConfiguration('langLoaclSync');
      this.languages = languages.child;
      // this.loadLanguages();
    },
    async loadLanguages () {
      let that = this;
      let lang = this.currentLan;
      setTimeout(function () {
        if (this.langLoaclSync)
          that.$store.dispatch('setLang', lang);
      }, 200)
    }
  },
  computed: {
    isLogin() {
      return Boolean(this.$store.state.user)
    },
    isFull() {
      return Boolean(this.$route.query.full || false);
    },
    currentLan: {
      set(val) {
        const lang = val;
        // 路由语言
        if (this.langLoaclSync)
          this.$store.dispatch('setLang', lang);
        // 本地持久语言
        storage.set('language', lang);
        // 网页语言
        document.getElementsByTagName('html')[0].lang = lang;
      },
      get() {
        const localAppLanguages = this.$root && this.$root.$i18n && this.$root.$i18n.locale;
        const localSroeageLanguage = storage.get('language')?.data?.value;
        const loaclWebLanguage = this.$route.query.lang

        return loaclWebLanguage || localSroeageLanguage || localAppLanguages || 'zh-CN';
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "src/assets/css/footer";

@footer-primary-color: #fff;
@footer-border-color: #00000008;
@footer-icon-color: #c5c5c5;

.footer {
  backdrop-filter: blur(50px);
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
</style>