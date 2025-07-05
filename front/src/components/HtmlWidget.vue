<template>
  <div class="html-widget-box">
    <Html :html="html" :mode="htmlShowMode" :class="`html-widget-size-animation html-widget-size html-widget-size-${htmlSize}`"
          v-if="html"></Html>
    <div class="html-widget-box-divider ivu-divider ivu-divider-horizontal"></div>
    <Row class="html-widget-toolbar" type="flex" justify="center" align="middle" :gutter="5">
      <Col flex="1">
        <a @click="openFullScreenView" v-if="!isDisableFullScreen">
          <Icon type="md-expand"/>
        </a>
        <Modal v-model="fullScreenStatus" fullscreen footer-hide :scrollable="true">
          <div class="container">
            <Card class="content" dis-hover>
              <Html :html="html" :mode="'large'" :class="`html-widget-size-${htmlSize}`"></Html>
            </Card>
          </div>
        </Modal>
      </Col>
      <Col>
        <Dropdown placement="top" trigger="click" @on-click="changeSize">
          <a href="javascript:void(0)">
            {{ $t(`basic.html.size.${htmlSize}`) }}
            <Icon type="ios-arrow-down"></Icon>
          </a>
          <DropdownMenu slot="list">
            <DropdownItem v-for="(i,index) in htmlSizeType" :key="index" :name="i" :selected="htmlSize === i">
              {{ $t(`basic.html.size.${i}`) }}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Divider type="vertical"></Divider>
        <Dropdown placement="top" trigger="click" @on-click="changeMode">
          <a href="javascript:void(0)">
            {{ $t(`basic.html.type.${htmlShowMode}`) }}
            <Icon type="ios-arrow-down"></Icon>
          </a>
          <DropdownMenu slot="list">
            <DropdownItem v-for="(i,index) in rendererType" :key="index" :label="i" :name="i"
                          :selected="htmlShowMode === i">
              {{ $t(`basic.html.type.${i}`) }}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </Col>
    </Row>
  </div>
</template>

<script>
import Html from "@/components/Html";

export default {
  name: "HtmlWidget",
  props: {
    html: {
      type: String,
      default: ""
    },
    isDisableFullScreen: {
      type: Boolean,
      default: false
    },
    htmlSizeType: {
      type: Array,
      default: () => ['x-large', 'large', 'default', 'small']
    },
    rendererType: {
      type: Array,
      default: () => ['code', 'text', 'renderer']
    }
  },
  data() {
    return {
      htmlContent: "",
      htmlSize: "default",
      htmlShowMode: "renderer",
      fullScreenStatus: false,
    }
  },
  components: {Html},
  watch: {
    isDisableFullScreen: {
      handler: val => {
        this.fullScreenStatus = val;
      }
    }
  },
  methods: {
    openFullScreenView() {
      this.fullScreenStatus = true;
    },
    changeMode(name) {
      this.htmlShowMode = name;
    },
    changeSize(name) {
      this.htmlSize = name;
    }
  }
}
</script>

<style lang="less">
.html-widget-box {
  transition: all .5s;
  margin-top: 5px;

  .html-widget-size {
    padding: 12px 15px !important;
  }

  .html-widget-size-x-large {
    &, * {
      font-size: 30px;
      line-height: 1.8;
    }

    p {
      margin-top: 5px;
      margin-bottom: 5px;
    }

    .img .img-box {
      margin-top: -46px;
    }
  }

  .html-widget-size-large {
    &, p, span, i, em, u, b, font {
      font-size: 20px;
      line-height: 1.5;
    }

    p {
      margin-top: 5px;
      margin-bottom: 5px;
    }

    .img .img-box {
      margin-top: -30px;
    }
  }

  .html-widget-size-default {
    white-space: pre-wrap !important;;
    word-wrap: break-word !important;;
    word-break: break-word !important;

    &, p, span, i, em, u, b, font {
      font-size: 13px;
      line-height: 1.5;
    }

    p {
      margin-top: 5px;
      margin-bottom: 5px;
    }

    li p {
      display: inline;
    }
  }

  .html-widget-size-small {
    &, p, span, i, em, u, b, font {
      font-size: 12px;
      line-height: 1.25;
    }

    p {
      margin-top: 1px;
      margin-bottom: 1px;
    }
  }
}
</style>

<style lang="less" scoped>
.html-widget-box {
  .html-widget-size-animation {
    animation: all .5s;
  }

  .html-widget-box-divider {
    opacity: .6;
    visibility: visible;
    margin: 0 !important;
  }

  &:hover .html-widget-box-divider {
    visibility: visible;
  }

  &:hover {
    height: auto;
  }

  &:focus .html-widget-toolbar,
  .html-widget-toolbar {
    user-select: none;
    overflow: hidden;
    padding: 0 5px;
    font-size: 12px;
    transition: all .25s;
    margin: -1px -1px 0 -1px;
    height: 20px;
    //visibility: hidden;
  }

  &:hover .html-widget-toolbar,
  &:active .html-widget-toolbar {
    overflow: initial !important;
    padding: 0 5px;
    height: 20px;
    visibility: visible;
  }
}
</style>
