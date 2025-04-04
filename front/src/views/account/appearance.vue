<template>
  <div class="theme ivu-radio-group-button">
    <div class="profile-body">
      <Row :gutter="10" type="flex" align="middle" justify="end">
        <Col>
          <Button type="primary" @click="changeTheme"> {{ $t('basic.button.save') }}</Button>
        </Col>
        <Col>
          <div class="theme-color" :style="`background-color: ${themes.child[themeIndex].themeColor}`"></div>
        </Col>
      </Row>
    </div>
    <Divider class="profile-divider"></Divider>
    <RadioGroup v-model="themeIndex" size="large" :button-style="'solid'" class="theme-card-content profile-body">
      <Card dis-hover
            v-for="(i, index) in themes.child" :key="index"
            :class="`${index == themeIndex ? 'ivu-radio-wrapper-checked' : ''}`">
        <div @click="themeIndex = index">
          <div class="theme-color" :style="`background-color: ${i.themeColor}`"></div>
          <h1>
            <b>{{ i.name }}</b>
            <Badge class="theme-badge" :text="i.version"></Badge>
          </h1>
        </div>
        <div>
          <span>{{ i.authorInfo.authorName }}</span>
          <Divider type="vertical"></Divider>
          <span>{{ i.authorInfo.authorUpdate }}</span>
        </div>
      </Card>
      <a href="//github.com/BFBAN/bfban-website/tree/master/front/public/theme" target="_blank">
        <Card dis-hover class="theme-card theme-card-not">
          <Icon type="md-add" size="30"/>
        </Card>
      </a>
    </RadioGroup>
  </div>
</template>

<script>
import {storage} from "@/assets/js"

import themes from "/public/config/themes.json"

export default {
  name: "appearance",
  data() {
    return {
      themes,
      themeIndex: 0,
    }
  },
  created() {
    this.getTheme();
  },
  methods: {
    /**
     * 获取主题
     * @returns {Promise<void>}
     */
    async getTheme() {
      let theme = storage.local.get('theme');

      if (theme.data && theme.data.value) {
        this.themes.child.forEach((i, index) => {
          if (i.name === theme.data.value.name) {
            this.themeIndex = index;
          }
        });
        await this.$store.dispatch('setTheme', theme.data.value);
        return;
      }

      themes.child.filter((i, index) => {
        if (i.name === themes.default) this.themeIndex = index
      });

      await this.$store.dispatch('setTheme', this.$store.state.$theme);
    },
    /**
     * 改变主题
     * @param val
     */
    changeTheme(val) {
      storage.local.set('theme', this.themes.child[this.themeIndex || 0]);

      window.location.reload();
    }
  }
}
</script>

<style lang="less" scoped>
.theme {
  .ivu-radio {
    position: absolute !important;
    top: 0;
    z-index: 10;
  }

  .theme-badge {
    margin-left: 10px;
  }

  .theme-card-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    grid-auto-rows: minmax(100px, auto);
  }

  @media screen and (max-width: 1024px) {
    .theme-card-content {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  .theme-card-not {
    opacity: 0.8;
    height: 100%;
    display: flex !important;
    justify-content: center;
    align-items: center;
  }

  .theme-card {
    margin-bottom: 10px !important;
  }

  .theme-color {
    display: flex;
    width: 20px;
    height: 20px;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, .08);
  }
}
</style>
