<template>
  <span class="html-link-card ivu-card ivu-card-bordered ivu-card-dis-hover" v-if="urlData">
    <a :href="urlData" target="_blank">
      <Row type="flex" align="middle" :gutter="5">
        <Col>
          <img :src="urlData.origin + '/favicon.ico'" width="15" height="15">
        </Col>
        <Col flex="1">
          {{ urlData.origin }}
        </Col>
      </Row>
    </a>
    <span class="html-link-card-describe">{{ urlData }}</span>
  </span>
</template>

<script>
import {http_connect, regular} from "@/assets/js";

export default {
  name: "HtmlLinkCard",
  props: {
    href: {
      type: String,
      default: ""
    },
  },
  data() {
    return {
      urlData: {}
    }
  },
  created() {
    if (this.href) {
      let data = new URL(decodeURI(this.href));
      if (data.searchParams.has("isWidget"))
        data.searchParams.delete('isWidget');
      this.urlData = data;
    }
  },
  methods: {
    getWebCode() {

    }
  },
  computed: {}
}
</script>

<style lang="less" scoped>
.html-link-card {
  transition: all .25s;
  cursor: pointer;
  display: inline-block;
  align-items: center;
  padding: 5px 8px;
  line-height: 2px !important;
  opacity: .8;

  &:hover {
    opacity: 1;
  }

  img {
    border-radius: 3px;
    user-select: none;
    width: 15px;
    height: 15px;
  }

  .html-link-card-describe {
    max-width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;
    display: block !important;
    font-size: 12px;
    opacity: .5;
  }
}
</style>