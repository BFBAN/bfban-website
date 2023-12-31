<template>
  <Card dis-hover :padding="0" class="ad-container mobile-hide" :class="adId && ads[adId].class || []"
        v-if="!isSkipAds"
        :style="ads[adId].style">
    <ins v-if="adId"
         :data-ad-client="'ca-pub-6625226616103631'"
         :data-ad-slot="adId"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
  </Card>
</template>

<script setup>
export default {
  name: 'AdsGoogle',
  props: {
    id: [Number, String],
    default: () => '7930151828'
  },
  watch: {
    id: {
      handler(value) {
        if (!this.isSkipAds)
          this.adId = value.toString();
      }
    }
  },
  data() {
    return {
      adId: "",
      ads: {
        "7930151828": {
          style: "width: 100%;height: 100px;",
          class: []
        },
        "1760339032": {
          style: "width: 100%;height: 300px;margin-bottom: 10px;",
          class: []
        }
      }
    }
  },
  created() {
    if (!this.isSkipAds)
      this.adId = this.id.toString();
  },
  computed: {
    isSkipAds() {
      return this.$route.query['skipAds'] || false;
    }
  }
}
</script>

<style lang="less">
.ad-container {
  overflow: hidden;

  ins, .ins {
    position: relative;
    z-index: 5;
    min-width: 100%;
    min-height: 100%;
  }
}

.ad-container:after {
  content: "AD";
  text-align: center;
  width: 100%;
  opacity: .4;
  font-size: 1.5rem;
  position: absolute;
  z-index: 0;
  top: calc(50% - 1.5rem);
}

.ad-container:before {
  content: "Advertising content";
  text-align: center;
  width: 100%;
  opacity: .2;
  font-size: .8rem;
  position: absolute;
  z-index: 0;
  top: calc(50% + 5px);
}
</style>
