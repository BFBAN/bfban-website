<template>
    <footer class="footer">
      <div class="container">
        <Row :gutter="30">
          <Col span="6">
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
                  BFBan QQ</a>
              </li>
              <li>
                <a href="https://github.com/BFBAN">github BFBAN</a>
              </li>
            </ul>
          </Col>
          <Col span="6">
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
          <Col span="6">
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
          <Col span="6">
            <div>选择语言</div>
            <Tag>
              <Select v-model="currentLan" class="switch-language" prefix="md-globe" size="small" placement="top-end" @on-change="switchLanguage">
                <Option v-for="item in languages" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </Tag>
            <p>
              &copy; 2018-2020
              All Rights Reserved.
            </p>
            <p>
              Made with <Icon type="ios-heart" color="#ed4014" />

              Host at
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
        {value: 'zh-CN', label: '简体中文'},
        {value: 'en-US', label: 'English'},
        {value: 'ja-JP', label: '日本語'},
      ]
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
    flex-shrink: 0;
    padding: 5rem;

    flex-shrink: 0;

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

