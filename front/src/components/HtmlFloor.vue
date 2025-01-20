<template>
  <span v-if="load">
     <Icon type="md-refresh" class="spin-icon-load"/>
  </span>
  <span v-else-if="floorData" class="html-floor" @click="onFloor(`floor-${id}`)">
    <Html class="ivu-alert ivu-alert-info" :html="floorData.content.text"></Html>
  </span>
  <span v-else class="html-floor">
    <div class="html-floor-card ivu-card ivu-card-bordered ivu-card-dis-hover">
      Not Floor {{ id }}
    </div>
  </span>
</template>

<script>
import {api, http} from "@/assets/js";
import Html from "@/components/Html.vue";

export default {
  name: "htmlFloor",
  components: {Html},
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
      floorData: null,
      load: false,
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
    // const getLocalFloorDomData = this.isGetFloorDom(this.id); // 从当前页面Dom里找数据
    // this.isContains = getLocalFloorDomData;
    this.getItemData();
  },
  methods: {
    async getItemData() {
      await this.getTimeLineItemData(this.id);
    },
    /**
     * 分享楼层
     * @param {number} floorId 楼层id，同时也是回复id
     * @returns {string} URL
     */
    getShareFloor(floorId) {
      let _url = new URL(window.location.href);
      if (!floorId) return _url;
      _url.hash = "#floor-" + floorId;
      return _url.toString() || "";
    },
    /**
     * 获取 时间轴 单条数据
     * @param {string} id
     * @returns {Promise}
     */
    async getTimeLineItemData(id) {
      this.load = true;
      const result = await http.get(api["player_timeline_item"], {
        params: {id}
      })
      this.load = false;
      let d = result.data;

      if (d.success === 1) {
        this.floorData = d.data;
      }
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

      document.documentElement.scrollTop =
          urlOffsetTop.offsetParent.offsetParent.offsetTop + urlOffsetTop.offsetParent.offsetParent.offsetHeight;
    },
  }
}
</script>

<style lang="less" scoped>
@import "@/assets/css/index";

.html-floor {
  user-select: none;
  cursor: auto;

  .html-floor-card {
    display: inline-block;
    padding: 2px 5px;
  }

  .html-floor-text {
    min-width: 0px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
