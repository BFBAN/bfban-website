<template>
  <div class="widget-banner" :style="`height: ${height}px`"
       @dblclick.prevent.stop="updateBackground">
    <div class="home-backdrop-filter ivu-btn-primary">
      <slot name="header"/>
    </div>
    <div class="widget-banner-body mt-7">
      <slot />
    </div>
    <div class="widget-banner-body-before"
         :style="`background: linear-gradient(rgba(21, 24, 41, 0) 0%,transparent ${showMask}%)`"></div>
    <div class="widget-banner-bg ivu-btn-primary">
      <img class="img" :src="backgroundPath"/>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    height: {
      type: Number,
      default: 280
    },
    showMask: {
      type: Number,
      default: 100
    }
  },
  data() {
    return {
      backgroundPath: '',
      images: [
        "922129.jpg",
        "922187.jpg",
        "922188.jpg",
        "922189.jpg",
        "922190.jpg",
        "922191.jpg",
        "922192.jpg",
        "922193.jpg",
        "922198.jpg",
        "922200.jpg",
        "922367.jpg",
        "922941.jpg",
      ]
    }
  },
  created() {
    this.updateBackground();
  },
  methods: {
    updateBackground() {
      // 随机背景
      const round = this.images[Math.round(Math.random() * this.images.length - 1)] || this.images[0];
      this.backgroundPath = require(`/public/images/background/${round}`);
    }
  }
}
</script>

<style scoped>

.widget-banner {
  overflow: hidden;
  position: relative;

  .widget-banner-body {
    position: absolute;
    z-index: 3;
    bottom: 0;
    left: 0;
    width: 100%;
  }

  .widget-banner-body-before {
    position: absolute;
    display: block;
    backdrop-filter: saturate(5%) opacity(10%);
    z-index: 2;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .home-backdrop-filter {
    position: relative;
    z-index: 3;
    background: rgba(var(--v-theme-on-surface-variant), .8);
    backdrop-filter: blur(10px);
  }

  .widget-banner-bg {
    background-position: top center;
    background-repeat: no-repeat;
    background-size: contain;
    opacity: .5;
    position: relative;
    z-index: 1;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;

    .img {
      transform: scale(1.5);
      position: absolute;
      width: 100%;
      max-width: 100%;
      opacity: .3;
      top: 0;
      left: 0;
      right: 0;
    }
  }
}
</style>
