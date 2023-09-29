<template>
  <div>
    {{ $t('basic.tip.notContent') }}

    <template v-if="showClassic">
      <div class="classic">
        <Divider>Classical speech</Divider>

        <div v-if="showClassic.image">
          <img :src="showClassic.image" width="50%"/>
        </div>
        <q v-if="showClassic.content">
          <div class="classic-content" v-html="showClassic.content"></div>
        </q>
      </div>
    </template>
  </div>
</template>

<script>
import classicMessages from "../../public/config/classicMessages.json";

export default {
  name: "Empty",
  data () {
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
}
</script>

<style lang="less" scoped>
.classic {
  width: 100%;
  margin-top: 30px;

  .classic-content {
    white-space: pre;
  }
}
</style>
