<script>
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
    $route: "getSlotName"
  },
  methods: {
    /**
     * 获取卡槽内名字
     */
    getSlotName() {
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
    <code :class="[!disabled ?  'text-distinguishing': '']"
          v-selectable-text
          class="text-distinguishing-letter" @dblclick="onDiffNameModel" @click.shift="onDiffNameModel">
      <slot></slot>
    </code>
    <Modal v-model="diffPanelModel" class="exposed-name-diff" footer-hide>
      <Row :gutter="10">
        <Col>
          <h2>{{$t('detail.exposedName.title')}}</h2>
        </Col>
        <Col>
          <Tag>Shift + Click</Tag>
          <Tag>Click * 2</Tag>
        </Col>
      </Row>
      <p>{{$t('detail.exposedName.description')}}</p>
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
