<template>
  <div class="html-widget-box">
    <Html :html="html" :mode="htmlShowMode" :class="`html-widget-size-${htmlSize}`" v-if="html"></Html>
    <div class="html-widget-box-divider ivu-divider ivu-divider-horizontal"></div>
    <Row class="html-widget-toolbar" type="flex" justify="center" align="middle" :gutter="5">
      <Col flex="1">
        <a @click="openFullScreenView">
          <Icon type="md-expand"/>
        </a>
        <Modal v-model="fullScreenStatus" fullscreen footer-hide :scrollable="true">
          <div class="container">
            <Card class="content">
              <Html :html="html" :mode="htmlShowMode" :class="`html-widget-size-${htmlSize}`"></Html>
            </Card>
          </div>
        </Modal>
      </Col>
      <Col>
        <Dropdown trigger="click" @on-click="changeSize">
          <a href="javascript:void(0)">
            {{ htmlSize }}
            <Icon type="ios-arrow-down"></Icon>
          </a>
          <DropdownMenu slot="list">
            <DropdownItem name="large" :selected="htmlSize == 'large'">Large</DropdownItem>
            <DropdownItem name="default" :selected="htmlSize == 'default'">Default</DropdownItem>
            <DropdownItem name="small" :selected="htmlSize == 'small'">Small</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Divider type="vertical"></Divider>
        <Dropdown trigger="click" @on-click="changeMode">
          <a href="javascript:void(0)">
            {{ htmlShowMode }}
            <Icon type="ios-arrow-down"></Icon>
          </a>
          <DropdownMenu slot="list">
            <DropdownItem name="code" :selected="htmlShowMode == 'code'">Code</DropdownItem>
            <DropdownItem name="text" :selected="htmlShowMode == 'text'">Text</DropdownItem>
            <DropdownItem name="renderer" :selected="htmlShowMode == 'renderer'">Renderer</DropdownItem>
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

  .html-widget-size-large {
    * {
      font-size: 20px;
      line-height: 2;
    }

    p {
      margin-top: 5px;
      margin-bottom: 5px;
    }
  }

  .html-widget-size-default {
    * {
      font-size: 13px;
      line-height: 1.5;
    }

    p {
      margin-top: 5px;
      margin-bottom: 5px;
    }
  }

  .html-widget-size-small {
    * {
      font-size: 12px;
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
