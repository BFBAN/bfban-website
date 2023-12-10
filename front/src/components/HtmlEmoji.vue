<script>
export default {
  name: "HtmlEmoji",
  props: {
    'data-name': {
      type: String,
      default: ""
    },
    'data-src': {
      type: String,
      default: ""
    },
    'data-style': {
      type: String,
      default: ""
    },
  },
  data() {
    return {
      afterData: {
        name: '',
        src: '',
        style: ''
      }
    }
  },
  created() {
    if (this.dataName)
      this.afterData.name = this.dataName;
    if (this.dataSrc)
      this.afterData.src = this.dataSrc;
    if (this.dataStyle)
      this.afterData.style = this.dataStyle;
  },
}
</script>

<template>
  <span>
    <Poptip trigger="hover">
      <img class="html-emoji" :src="afterData.src" :style="afterData.style"/>
      <div slot="content">{{ afterData.name}}</div>
    </Poptip>
  </span>
</template>

<style scoped lang="less">
.html-emoji {
  width: 20px;
  height: 20px;
  margin-bottom: -0.21rem;
  vertical-align: baseline;
  cursor: default;
}
</style>
