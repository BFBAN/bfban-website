<template>
  <div class="video">
    <template v-if="imageStatus == 0">
      <div class="video-error video-box ivu-card ivu-card-bordered ivu-card-dis-hover">
        <Badge>
          <Icon type="md-refresh" class="spin-icon-load" slot="count" size="20" />
          <Icon type="ios-videocam" size="50" />
        </Badge>
        <html-link :isPoptip="false" :href="src || 'link'"></html-link>
        <iframe class="iframe-load video-box"
                :src="src"
                sandbox="allow-same-origin allow-forms allow-scripts"
                @error="onError"
                @load="onLoad"></iframe>
      </div>
    </template>
    <template v-else-if="imageStatus == 1">
      <iframe class="iframe video-box ivu-card ivu-card-bordered ivu-card-dis-hover" :src="src"></iframe>
    </template>
    <template v-else-if="imageStatus == -1">
      <div class="video-error video-box ivu-card ivu-card-bordered ivu-card-dis-hover" @click="openUrl">
        <Badge>
          <Icon type="md-alert" slot="count" size="20" />
          <Icon type="ios-videocam" size="50" />
        </Badge>
        <html-link :isPoptip="false" :href="src || 'link'"></html-link>
      </div>
    </template>
  </div>
</template>

<script>
import HtmlLink from "@/components/HtmlLink.vue";

export default {
  name: "HtmlVideo",
  components: {HtmlLink},
  props: {
    src: {
      type: String,
      default: ""
    },
  },
  data () {
    return {
      imageStatus: 0,
    }
  },
  methods: {
    onLoad (event) {
      if (this.src != "")
        this.imageStatus = 1;
      else if (this.src == "")
        this.imageStatus = -1;
    },
    onError (event) {
      this.imageStatus = -1;
    },
    openUrl() {
      if (this.src)
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
    width: calc(100% + 16px);
    margin: 10px -8px 10px -8px;
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
