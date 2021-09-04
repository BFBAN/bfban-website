<template>
    <footer class="footer">
      <div class="container">
        <Row :gutter="30" >
          <Col :xs="{span: 24 ,pull: 1, push: 1}" :lg="{span: 5,pull: 0, push: 0}">
            <img src="https://i.loli.net/2018/11/03/5bdd8e977b10d.png"
                 width="40"
                 height="40"
                 alt="bfban logo"/>
            <p>联BFBAN - 全球作弊玩家数据库</p>
          </Col>
          <Col :xs="{span: 10 ,pull: 1, push: 1}" :lg="{span: 5,pull: 0, push: 0}">
            <h4><b>社区</b></h4>
            <ul>
              <li>
                <a target="_blank" href="https://discord.gg/KCBM3GAW59">
                  Community network Discord
                </a>
              </li>
              <li>
                <a target="_blank" href="https://kaihei.co/uoJKC0">
                  战地中文社区
                </a>
              </li>
              <li>
                <a target="_blank" href="https://jq.qq.com/?_wv=1027&amp;k=pC07TOvE">
                  QQ BFBan</a>
              </li>
              <li>
                <a href="https://github.com/BFBAN">github BFBAN</a>
              </li>
              <li>
                <a href="https://space.bilibili.com/387820951">
                  bilibili BFBAN
                </a>
              </li>
            </ul>
          </Col>
          <Col :xs="{span: 10 ,pull: 1, push: 1}" :lg="{span: 5,pull: 0, push: 0}">
            <h4><b>功能</b></h4>
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
            <h4><b>联系方式</b></h4>
            <ul>
              <li>
                <a target="_blank" href="http://mail.qq.com/cgi-bin/qm_share?t=qm_mailme&email=-5GQjZqPk4bOv52ZnZ6R0ZyQkg">
                  投诉邮箱
                </a>
              </li>
              <li>
                <a target="_blank" href="https://support.qq.com/products/64038">
                  意见建议
                </a>
              </li>
            </ul>
          </Col>
          <Col :xs="{span: 22 ,pull: 1, push: 1}" :lg="{span: 5,pull: 0, push: 0}">
            <b>选择语言</b>
            <Tag>
              <Select v-model="currentLan" class="switch-language" prefix="md-globe" size="small" placement="top-end" @on-change="switchLanguage">
                <Option v-for="item in languages" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </Tag>
            <p>&copy; 2018-2020 All Rights Reserved.</p>
            <p>Made with <Icon type="ios-heart" color="#ed4014" />Host at
              <a target="_blank" href="https://battlefield.now.sh/">AWSL</a>
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
      currentLan: navigator.language ? detectLanguage(navigator.language) : 'zh-CN',
      languages: [
        { value: "zh-CN", label: "简体中文" },
        { value: "en-US", label: "English" },
        { value: "ja-JP", label: "日本語" },
        { value: "ru-RU", label: "Русский" },
        { value: "tr-TR", label: "Türkçe" },
      ],
    }
  },
  methods: {
    switchLanguage(val) {
      this.setLang(val);
    },
    setLang(lang) {
      this.$store.dispatch('setLang', lang);
    }
  }
}
</script>

<style lang="scss">
  .footer {
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
    }

    b {
      font-size: 20px;
      padding-right: 10px;
      padding-bottom: 10px;
    }

    .switch-language {
      width: 100px;
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

