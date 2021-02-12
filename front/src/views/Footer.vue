<template>
    <footer class="footer">
      <p>
        <router-link :to="{name: 'report'}">{{$t('header.report')}}</router-link>
        <router-link :to="{name: 'about'}">{{$t('header.about')}}</router-link>

        <Select v-model="currentLan" class="switch-language" prefix="md-globe" size="small" placement="top-end" @on-change="switchLanguage">
          <Option v-for="item in languages" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
      </p>
      <p>
        Made with <Icon type="ios-heart" color="#ed4014" />

        Host at
        <a target="_blank" href="https://bandofbrothers.site/">BoB</a>
      </p>
      <p>
        &copy; 2018-2021
        All Rights Reserved.
      </p>
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
    text-align: center;
    padding: 1rem;
    background-color: rgba(252, 252, 252, 0.8);

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

