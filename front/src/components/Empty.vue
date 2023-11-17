<template>
  <div>
    {{ $t('basic.tip.notContent') }}

    <template v-if="notHint">
      <div class="classic">
        <Divider>Classical speech</Divider>

        <div v-if="classic.image">
          <img :src="classic.image" width="50%"/>
        </div>
        <q v-if="classic.content">
          <div class="classic-content" v-html="classic.content"></div>
        </q>
      </div>
    </template>
  </div>
</template>

<script>
import classicMessages from "../../public/config/classicMessages.json";

export default {
  name: "Empty",
  props: {
    notHint: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      classicMessageList: classicMessages['child'],
      classic: {},
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

      this.classic = this.classicMessageList[index];

      if (this.classic && this.classic.contentLang && this.classic.contentLang[this.$i18n.locale])
        this.classic.content = this.classic.contentLang[this.$i18n.locale];
      else
        this.classic.content = this.classic.contentLang['en-US'];
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
