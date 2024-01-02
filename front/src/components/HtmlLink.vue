<template>
  <Poptip :padding="0" max-width="300" trigger="hover" transfer :disabled="getProtocol == 'mailto:'"
          @on-popper-show="onPoptipShow(false)"
          @on-popper-hide="onPoptipShow(true)">
    <span class="html-link">
      <template v-if="getProtocol == 'http:' || getProtocol == 'https:'">
        <Icon type="md-link"/>
      </template>
      <template v-else-if="getProtocol == 'mailto:'">
        <Icon type="ios-mail-outline"/>
      </template>
      <a :href="afterData.href" target="_blank" rel="noopener noreferrer">{{ afterData.text || afterData.href }}</a>
    </span>
    <template v-if="isIframeShow && isPoptip">
      <div class="link-iframe" slot="content">
        <template v-if="linkLoad">
          <div class="link-load link-box" style="position: relative; z-index: 1;">
            <Badge>
              <Icon type="md-refresh" class="spin-icon-load" slot="count" size="20"/>
              <Icon type="md-browsers" size="50"/>
            </Badge>
          </div>
        </template>
        <template v-show="!isIframeShow">
          <iframe :src="disableIframe ? '' : afterData.href" v-show="!linkLoad"
                  allowTransparency="true"
                  security="restricted"
                  frameborder="no"
                  border="0"
                  marginwidth="0"
                  marginheight="0"
                  scrolling="no"
                  sandbox="allow-same-origin allow-forms allow-scripts"></iframe>
        </template>
      </div>
    </template>
  </Poptip>
</template>

<script>
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
    },
    isPoptip: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      disableIframe: true,
      linkLoad: true,
      linkTime: null,
      afterData: {
        href: '',
        text: ''
      }
    }
  },
  created() {
    // unescape is deprecated， by: https://developer.mozilla.org/en-US/docs/web/javascript/reference/global_objects/escape
    if (this.href)
      this.afterData.href = decodeURI(this.href);
    if (this.text)
      this.afterData.text = decodeURI(this.text);
  },
  methods: {
    onPoptipShow(status) {
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
    isIframeShow() {
      // TODO 正则
      if (!this.afterData.href) return false;
      let url = new URL(this.afterData.href);
      return url.protocol.indexOf('http:') >= 0 || url.protocol.indexOf('https:') >= 0;
    },
    getProtocol() {
      if (!this.afterData.href) return '';
      let url = new URL(this.afterData.href);
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
  border-radius: 3px;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: -10px;
  position: relative;
  height: 200px;
  width: 100%;

  iframe {
    overflow: hidden !important;
    position: relative;
    outline: 0;
    border: 0;
    width: 400%;
    height: 400%;
    transform: scale(0.25);
    transform-origin: top left;

    body {
      overflow: hidden
    }
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
