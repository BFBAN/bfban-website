<template>
  <Poptip :padding="'0'" max-width="300" trigger="hover" @on-popper-show="onPoptipShow(false)" @on-popper-hide="onPoptipShow(true)">
    <span class="html-link">
      <template v-if="getProtocol == 'http:' || getProtocol == 'https:'">
        <Icon type="md-link"/>
      </template>
      <template v-else-if="getProtocol == 'mailto:'">
        <Icon type="ios-mail-outline" />
      </template>
      <a :href="href" target="_blank">{{ text }}</a>
    </span>
    <template v-if="isIframeShow">
      <div class="link-iframe" slot="content">
        <template v-if="linkLoad">
          <div class="link-load link-box" style="position: relative; z-index: 1;">
            <Badge>
              <Icon type="md-refresh" class="spin-icon-load" slot="count" size="20" />
              <Icon type="md-browsers" size="50" />
            </Badge>
          </div>
        </template>
        <iframe :src="disableIframe ? '' : href" v-show="!linkLoad"></iframe>
      </div>
    </template>
  </Poptip>
</template>

<script>
import {regular} from "@/assets/js";

export default {
  name: "HtmlLink",
  props: {
    href: {
      type: String,
      default: ""
    },
    text: {
      type: String,
      default: ""
    }
  },
  data () {
    return {
      disableIframe: false,
      linkLoad: true,
      linkTime: null
    }
  },
  created() {
    // this.onIframeLoad();
  },
  methods: {
    onPoptipShow (status) {
      const that = this;
      this.disableIframe = status;

      // 展开
      if (status == false) {
        // 加载动画
        that.linkLoad = true;
        this.linkTime = setTimeout(function () {
          that.linkLoad = false;
          that.linkTime = null;
        }, 2000);
      }
      // 收起
      if (status == true) {
        that.linkLoad = false;
        that.linkTime = null;
      }
    },
  },
  computed: {
    isIframeShow () {
      // TODO 正则
      let url = new URL(this.href);
      return url.protocol.indexOf('http:') >= 0 || url.protocol.indexOf('https:') >= 0;
    },
    getProtocol () {
      let url = new URL(this.href);
      return url.protocol;
    }
  }
}
</script>

<style lang="less" scoped>
@import "@/assets/css/icon.less";

.link-load {
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  height: 200px;
  width: 300px;
  text-align: center;
}

.link-iframe {
  overflow: hidden;
  margin-bottom: -10px;
  position: relative;
  height: 200px;
  width: 100%;

  iframe {
    overflow: hidden;
    position: relative;
    outline: 0;
    border: 0;
    width: 400%;
    height: 400%;
    transform: scale(0.25);
    transform-origin: top left;
  }

  &::after {
    overflow: hidden;
    content: "";
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
  }
}

.html-link {
  padding-bottom: 1px;
  border-bottom-width: 1px;
  border-bottom-style: dashed;
  transition: all .25s;

  a {
    opacity: .6;
  }

  a:hover {
    opacity: 1;
  }
}

.html-link:hover {
  backdrop-filter: blur(20px);
  border-bottom-style: solid;
}
</style>