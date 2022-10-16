<template>
  <span v-if="isContains" class="html-floor" @click="onFloor(`floor-${id}`)">
    <div class="html-floor-card ivu-card ivu-card-bordered ivu-card-dis-hover">
      <p><Icon type="ios-link"/>{{ id }}</p>
      <p class="html-floor-text" v-if="floorDom && floorDom.content">{{ floorDom.content }}</p>
    </div>
  </span>
  <span v-else class="html-floor">
    <div class="html-floor-card ivu-card ivu-card-bordered ivu-card-dis-hover">
      Not Floor {{ id }}
    </div>
  </span>
</template>

<script>
export default {
  name: "htmlFloor",
  props: {
    id: {
      type: String,
      default: ''
    },
    isClick: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isContains: true,
      floorDom: null
    }
  },
  watch: {
    id: {
      handler(val) {
        this.isContains = this.isGetFloorDom(val);
      },
      deep: true
    }
  },
  mounted() {
    this.isContains = this.isGetFloorDom(this.id);
  },
  methods: {
    isGetFloorDom(id) {
      if (!id) return;

      let floorDom = document.getElementById(`floor-${id}`);
      let content = floorDom && floorDom.querySelector('.ql-editor') && floorDom.querySelector('.ql-editor').innerText || this.$i18n.t('basic.tip.notContent');
      this.floorDom = {
        username: "username",
        content
      }
      return !!floorDom || false;
    },
    /**
     * 滚动至楼层位置
     * @param id
     */
    onFloor(id) {
      if (!this.isClick) return;

      // 锚点
      let urlOffsetTop = document.getElementById(
          id.replaceAll('#', '')
      );
      let className = urlOffsetTop.offsetParent.className;
      urlOffsetTop.offsetParent.className = className + " timeline-scroll-floor";
      setInterval(function () {
        if (urlOffsetTop.offsetParent)
          urlOffsetTop.offsetParent.className = className;
      }, 10000);

      document.documentElement.scrollTop = urlOffsetTop.offsetParent.offsetParent.offsetTop;
    },
  }
}
</script>

<style lang="less" scoped>
.html-floor {
  user-select: none;
  cursor: pointer;

  .html-floor-card {
    display: inline-block;
    padding: 2px 5px;
  }

  .html-floor-text {
    min-width: 0px;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>