<template>
  <div class="container">
    <div class="content notFound" align="center">
      <div class="content-main">
        <h1>404</h1>
        <h4>{{ $t("basic.tip.notFound") }}</h4>
      </div>

      <template v-if="showClassic">
        <Card dis-hover style="width: 100%">
          <div v-if="showClassic.image">
            <img :src="showClassic.image" width="50%"/>
          </div>
          <q v-if="showClassic.content">
            <div v-html="showClassic.content"></div>
          </q>
        </Card>
      </template>
    </div>
  </div>
</template>

<script>
import BFBAN from "../assets/js/bfban";

import classicMessages from "../../public/conf/classicMessages.json";

export default new BFBAN({
  data() {
    return {
      classicMessageList: classicMessages['child'],
      showClassic: {},
      showClassicIndex: 0
    }
  },
  watch: {
    $route: function (val) {
      this.onUpdateClassic(this.showClassicIndex)
    },
    '$i18n.locale': function (val) {
      this.onUpdateClassic(this.showClassicIndex)
    }
  },
  created() {
    this.onUpdateClassic();
  },
  methods: {
    onUpdateClassic(showClassicIndex) {
      let index = this.classicMessageList.length;

      if (showClassicIndex && showClassicIndex >= 0)
        index = showClassicIndex;
      else
        index = Math.floor(Math.random() * (this.classicMessageList.length));

      this.showClassic = this.classicMessageList[index];

      if (this.showClassic && this.showClassic.contentLang && this.showClassic.contentLang[this.$i18n.locale])
        this.showClassic.content = this.showClassic.contentLang[this.$i18n.locale];
      else
        this.showClassic.content = this.showClassic.contentLang['en-US'];
    }
  }
});
</script>

<style lang="less" scoped>
.notFound {
  min-height: 500px;
  height: 100%;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  align-content: center;

  .content-main {
    margin: 20px 0 100px 0;

    h1 {
      font-size: 15rem;
      color: #8f8f8f;
    }
  }

}
</style>
