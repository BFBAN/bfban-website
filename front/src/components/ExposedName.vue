<script setup>
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      diffPanelModel: false,
      text: ''
    }
  },
  watch: {
    '$route': 'getSlotName'
  },
  methods: {
    /**
     * 获取卡槽内名字
     */
    getSlotName () {
      if (this.$slots.default && this.$slots.default.length >= 0)
        this.text = this.$slots.default[0].text;
    },
    /**
     * 打开对比面板
     */
    onDiffNameModel() {
      if (this.disabled) return;

      this.getSlotName();
      this.diffPanelModel = true;
    }
  }
}
</script>

<template>
  <span>
    <code class="text-distinguishing text-distinguishing-letter" @click="onDiffNameModel">
      <slot></slot>
    </code>
    <Modal v-model="diffPanelModel" class="exposed-name-diff" footer-hide>
      <h2>魔法显现 (beta)</h2>
      <p>通常有些作弊者会在名字上混淆，这是由于字体导致大小写或数字和字母相近引起误会</p>
      <br class="user-select-none">

      <Card dis-hover class="exposed-name-diff-card">
        <div class="exposed-name-diff-title text-distinguishing-letter">
          <span v-for="(i, text_index) in text" :key="text_index">{{ i }}</span>
        </div>
        <br class="user-select-none">
        <Row :gutter="20" type="flex" justify="center" align="middle">
          <Col span="24" ref="text">
            <slot></slot>
          </Col>
          <Col>
            <Icon type="md-shuffle"/>
          </Col>
          <Col span="24">
            <code class="text-distinguishing-letter">
              <slot></slot>
            </code>
          </Col>
        </Row>
      </Card>
    </Modal>
  </span>
</template>

<style scoped lang="less">
@import "@/assets/css/text";

.text-distinguishing {
  cursor: help;
}

.exposed-name-diff {
  font-size: 13px !important;
  word-break: keep-all;

  &-title {
    font-size: 2rem;
  }

  .exposed-name-diff-card {
    text-align: center;
  }
}
</style>
