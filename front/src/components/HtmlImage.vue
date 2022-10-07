<template>
  <div class="img" @click="show">
    <img :src="src"/>
    <div class="img-hover ivu-card">
      <Icon type="ios-search" size="50" />
    </div>
  </div>
</template>

<script>
import 'viewerjs/dist/viewer.css'

import VueViewer from 'v-viewer'
import Vue from "vue";

Vue.use(VueViewer);

export default {
  name: "HtmlImage",
  props: {
    src: {
      type: String,
      default: ""
    },
  },
  methods: {
    show () {
      this.$viewerApi({
        options: {
          toolbar: false,
          navbar: false,
          keyboard: false
        },
        images: [this.src],
      })
    }
  }
}
</script>

<style lang="less" scoped>
.img {
  position: relative;
  cursor: pointer;

  .img-hover {
    border-radius: 0 !important;
    display: flex;
    justify-content: center;
    align-content: center;
    flex-direction: column;
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: all .25s;
    opacity: 0;
  }
}

.img:hover {
  .img-hover {
    opacity: .5;
  }
}
</style>