<template>
  <div class="doc">
    <div class="item" v-for="(item, index) in data" :key="index">
      <div class="contentBox">
        <div class="line">
          <div class="lineItem" v-for="item in line" :key="item"><div></div></div>
        </div>
        <div class="content">
          <div class="point"><div></div></div>
          <div class="font" v-html="item.text"></div>
        </div>
      </div>
      <item v-if="item.children" :data="item.children" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'item',
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    line() {
      return (this.$parent.line || this.$parent.line === 0) ? this.$parent.line + 1 : 0
    }
  },
}
</script>

<style lang="less" scoped>
.doc {
  .item {
    .contentBox {
      display: flex;
      .line {
        display: flex;
        .lineItem {
          width: 20px;
          border-left: 1px solid rgb(222, 222, 225);
          transform: translateX(12px);
        }
      }
      .content {
        padding: 2px 0 2px 28px;
        position: relative;
        flex: 1;
        .point {
          position: absolute;
          left: 3px;
          top: 6px;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          >div {
            top: 6px;
            left: 6px;
            width: 6px;
            height: 6px;
            background-color: #646a73;
            border-radius: 3px;
          }
        }
        .font {
          line-height: 26px;
          font-size: 16px;
        }
      }
    }
  }
}
</style>
