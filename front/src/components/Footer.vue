<template>
    <footer class="footer">
      <div class="container">
        <Row :gutter="30" >
          <Col :xs="{span: 24 ,pull: 1, push: 1}" :lg="{span: 5,pull: 0, push: 0}">

            <Badge :count="logoCount" overflow-count="999999">
              <Avatar v-if="logoCount > 10" size="40">
                干嘛？
                {{ getLog() }}
              </Avatar>
              <img v-else
                   src="https://i.loli.net/2018/11/03/5bdd8e977b10d.png"
                   width="40"
                   height="40"
                   @click="logoCount++;"
                   alt="bfban logo"/>
            </Badge>

            <p>{{ $t("footer.column.col1.text") }}</p>
          </Col>
          <Col :xs="{span: 10 ,pull: 1, push: 1}" :lg="{span: 5,pull: 0, push: 0}">
            <h4><b>{{ $t("footer.column.col2.title") }}</b></h4>
            <ul>
              <li>
                <a target="_blank" href="https://discord.gg/KCBM3GAW59">
                  Community network Discord<Icon type="ios-share" />
                </a>
              </li>
              <li>
                <a target="_blank" href="https://kaihei.co/uoJKC0">
                  战地中文社区<Icon type="ios-share" />
                </a>
              </li>
              <li>
                <a target="_blank" href="https://jq.qq.com/?_wv=1027&amp;k=pC07TOvE">
                  QQ BFBan<Icon type="ios-share" />
                </a>
              </li>
              <li>
                <a target="_blank" href="https://github.com/BFBAN">github BFBAN<Icon type="ios-share" /></a>
              </li>
              <li>
                <a target="_blank" href="https://space.bilibili.com/387820951">
                  bilibili BFBAN<Icon type="ios-share" />
                </a>
              </li>
            </ul>
          </Col>
          <Col :xs="{span: 10 ,pull: 1, push: 1}" :lg="{span: 5,pull: 0, push: 0}">
            <h4><b>{{ $t("footer.column.col3.title") }}</b></h4>
            <ul>
              <li>
                <router-link :to="{name: 'report'}">{{$t('header.report')}}</router-link>
              </li>
              <li>
                <router-link :to="{name: 'about'}">{{$t('header.about')}}</router-link>
              </li>
            </ul>
          </Col>
          <Col :xs="{span: 10 ,pull: 1, push: 1}" :lg="{span: 4,pull: 0, push: 0}" >
            <h4><b>{{ $t("footer.column.col3.title") }}</b></h4>
            <ul>
              <li>
                <a target="_blank" href="http://mail.qq.com/cgi-bin/qm_share?t=qm_mailme&email=-5GQjZqPk4bOv52ZnZ6R0ZyQkg">
                  投诉邮箱<Icon type="ios-share" />
                </a>
              </li>
              <li>
                <a target="_blank" href="https://support.qq.com/products/64038">
                  意见建议<Icon type="ios-share" />
                </a>
              </li>
            </ul>
          </Col>
          <Col :xs="{span: 22 ,pull: 1, push: 1}" :lg="{span: 5,pull: 0, push: 0}">
            <b>选择语言</b>
            <Tag size="large">
              <Select v-model="currentLan" class="switch-language" prefix="md-globe" size="small" placement="top-end" @on-change="switchLanguage">
                <Option v-for="item in languages" :value="item.name" :key="item.name">{{ item.label }}</Option>
              </Select>
            </Tag>
            <p>&copy; 2018-{{new Date().getFullYear()}} All Rights Reserved.</p>
            <p>Made with <Icon type="ios-heart" color="#ed4014" />Host at
              <a target="_blank" href="https://gametools.network/">GameTools-Community Network</a>
            </p>
          </Col>
        </Row>
      </div>
    </footer>
</template>

<script>
import { detectLanguage } from '@/mixins/common';

export default {
  data() {
    return {
      logoCount: 0,
      languages: [],
    }
  },
  created() {
    this.ready();
  },
  methods: {
    async ready () {
      const languages = await import('/src/assets/languages.json');

      this.languages = this.languages.concat(languages.child)
    },
    switchLanguage(val) {
      this.setLang(val);
    },
    setLang(lang) {
      this.$store.dispatch('setLang', lang);
    },
    getLog() {
      console.log('怎么啦？要不让大哥哥康康？');
    }
  },
  computed: {
    currentLan () {
      return this.$root.$i18n.locale || 'zh-CN';
    }
  }
}
</script>

<style lang="scss">
  .footer {
    backdrop-filter: blur(50px);
    text-align: left;
    border-top: 1px solid #00000008;
    //background: #f9f7ff;
    flex-shrink: 0;
    padding: 3rem 0;

    flex-shrink: 0;

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
        color: #c5c5c5;
        font-size: 15px;
      }
    }

    b {
      border-left: 3px solid #3f1388;
      display: block;
      margin-bottom: 10px;
      color: #585410;
      padding-left: 10px;
      font-size: 20px;
      padding-right: 10px;
    }

    .switch-language {

      .ivu-select-selection {
          border: none;
        background-color: rgba(255, 255, 255, 0);
      }
      .ivu-select-selection-focused {
        box-shadow: none;
      }
    }
  }
</style>

