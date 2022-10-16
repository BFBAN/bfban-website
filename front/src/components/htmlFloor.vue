<template>
  <span v-if="isContains" class="html-floor" @click="onFloor(`floor-${id}`)">
    <u><b><Icon type="ios-link"/>  floor {{ id }}</b></u>
  </span>
  <span v-else>Not Floor {{ id }}</span>
</template>

<script>
export default {
  name: "htmlFloor",
  props: {
    id: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isContains: false
    }
  },
  created() {
    this.isContains = this.isGetFloorDom(this.id);
  },
  methods: {
    isGetFloorDom(id) {
      return !!document.getElementById(`floor-${id}`) || false;
    },
    /**
     * 滚动至楼层位置
     * @param id
     */
    onFloor(id) {
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
}
</style>