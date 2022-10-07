<template>
  <div class="video">
    <template v-if="imageStatus == 0">
      <div class="video-error video-box">
        <Badge>
          <Icon type="md-refresh" class="spin-icon-load" slot="count" size="20" />
          <Icon type="ios-videocam" size="50" />
        </Badge>
        <p>{{src}}</p>
        <iframe class="iframe-load video-box" :src="src" @error="onError" @load="onLoad"></iframe>
      </div>
    </template>
    <template v-else-if="imageStatus == 1">
      <iframe class="iframe video-box" :src="src"></iframe>
    </template>
    <template v-else-if="imageStatus == -1">
      <div class="video-error" @click="openUrl">
        <Badge>
          <Icon type="md-alert" slot="count" size="20" />
          <Icon type="ios-videocam" size="50" />
        </Badge>
        <p>{{src}}</p>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: "HtmlVideo",
  props: {
    // src: {
    //   type: String,
    //   default: ""
    // },
  },
  data () {
    return {
      imageStatus: 0,
      src: "https://media.geeksp4"
    }
  },
  methods: {
    onLoad (event) {
      this.imageStatus = 1;
    },
    onError (event) {
      this.imageStatus = -1;
    },
    openUrl() {
      window.open(this.src);
    },
  }
}
</script>

<style lang="less" scoped>
@import "@/assets/css/icon.less";

.timeline-description {
  .video-error {
    text-align: center;
    padding: 20px 0;
  }

  .video {
    user-select: none;
    position: relative;
    width: calc(100% + 20px);
    margin: 10px -10px 10px -10px;
    overflow: hidden;

    .iframe {
      height: 300px;
      border: 0;
      outline: 0;
      width: 100%;
    }

    .iframe-load {
      display: none;
    }
  }
}
</style>