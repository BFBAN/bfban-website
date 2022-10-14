<template>
  <div class="img">
    <template v-if="imageStatus == 0">
      <div class="img-error img-box">
        <Badge>
          <Icon type="md-refresh" class="spin-icon-load" slot="count" size="20" />
          <Icon type="md-images" size="50" />
        </Badge>
        <img style="display: none" :src="src" @error="onError" @load="onLoad"/>
        <p>{{src}}</p>
      </div>
    </template>
    <template v-else-if="imageStatus == 1">
      <div class="img-box">
        <img :src="src" class="img-tag"/>
        <div class="img-hover ivu-card" @click="show">
          <Icon type="ios-search" size="50" />
        </div>
      </div>
    </template>
    <template v-else-if="imageStatus == -1">
      <div class="img-error img-box" @click="openUrl">
        <Badge>
          <Icon type="md-alert" slot="count" size="20" />
          <Icon type="md-images" size="50" />
        </Badge>
        <p>{{src}}</p>
      </div>
    </template>
  </div>
</template>

<script>
import 'viewerjs/dist/viewer.css'

import VueViewer from 'v-viewer'
import Vue from "vue";
import {regular} from "@/assets/js";

Vue.use(VueViewer);

export default {
  name: "HtmlImage",
  props: {
    src: {
      type: String,
      default: ""
    },
    images: {
      type: String,
      default: ""
    }
  },
  data () {
    return {
      load: false,
      imageStatus: 0,
      viewImages: [],
    }
  },
  watch: {
    images: {
      handler (val, oldVal) {
        console.log(val)
        this.viewImages = val.split(",");
      },
      deep: true
    }
  },
  created() {
    this.viewImages = this.images.split(",");
  },
  methods: {
    onLoad () {
      this.imageStatus = 1;
    },
    onError () {
      this.imageStatus = -1;
    },
    openUrl() {
      window.open(this.src);
    },
    show () {
      if (this.imageStatus <= 0) return;

      this.$viewerApi({
        options: {
          toolbar: false,
          navbar: true,
          keyboard: false,
          fullscreen: true
        },
        images: this.viewImages,
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import "@/assets/css/icon.less";

.img {
  overflow: hidden;
  position: relative;
  min-height: 80px;
  //user-select: none;

  .img-error {
    text-align: center;
    padding: 20px 0;
  }

  .img-hover {
    cursor: pointer;
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